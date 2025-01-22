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
        const stageWidth = 512; // Fixed stage width
        const stageHeight = 512; // Fixed stage height

        // Calculate scale to fit
        const scaleX = containerWidth / stageWidth;
        const scaleY = containerHeight / stageHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Never scale up beyond original size

        // Update stage size while maintaining aspect ratio
        stage.width(stageWidth);
        stage.height(stageHeight);
        stage.scale({ x: scale, y: scale });

        // Center the stage in the container
        stage.x((containerWidth - stageWidth * scale) / 2);
        stage.y((containerHeight - stageHeight * scale) / 2);

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