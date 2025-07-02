import { useCallback, useEffect } from "react";
import Konva from "konva";

interface UseAutoResizeProps {
    stage: Konva.Stage | null;
    container: HTMLDivElement | null;
}

export const useAutoResize = ({ stage, container }: UseAutoResizeProps) => {
    const autoZoom = useCallback(() => {
        if (!stage || !container) return;

        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        // Ensure container is square (1:1 aspect ratio)
        const size = Math.min(containerWidth, containerHeight);
        
        // Use container size as stage size to maintain 1:1 ratio
        const stageWidth = size;
        const stageHeight = size;

        // Set stage to fill the container exactly (no scaling needed for square container)
        stage.width(stageWidth);
        stage.height(stageHeight);
        stage.scale({ x: 1, y: 1 }); // 1:1 scale since container is already the right size

        // Center the stage in the container (should be 0,0 for square container)
        stage.x(0);
        stage.y(0);

        // Make sure all layers are visible
        stage.getLayers().forEach(layer => {
            layer.visible(true);
            layer.batchDraw();
        });

    }, [stage, container]);

    useEffect(() => {
        if (stage && container) {
            const resizeObserver = new ResizeObserver(autoZoom);
            resizeObserver.observe(container);
            autoZoom(); // Initial resize
            return () => resizeObserver.disconnect();
        }
    }, [stage, container, autoZoom]);
};