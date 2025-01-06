import { useCallback, useEffect } from "react";
import Konva from "konva";

interface UseAutoResizeProps {
    stage: Konva.Stage | null;
    container: HTMLDivElement | null;
}

export const useAutoResize = ({ stage, container }: UseAutoResizeProps) => {
    const autoZoom = useCallback(() => {
        if (!stage || !container) return;

        const width = container.offsetWidth;
        const height = container.offsetHeight;

        // Update stage size
        stage.width(width);
        stage.height(height);

        // Calculate scale to fit
        const scaleX = width / stage.width();
        const scaleY = height / stage.height();
        const scale = Math.min(scaleX, scaleY) * 0.85; // 0.85 is the zoom ratio

        // Center and scale all layers
        stage.getLayers().forEach(layer => {
            layer.scale({ x: scale, y: scale });
            layer.position({
                x: (width - stage.width() * scale) / 2,
                y: (height - stage.height() * scale) / 2
            });
            layer.batchDraw();
        });

    }, [stage, container]);

    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null;

        if (stage && container) { 
            resizeObserver = new ResizeObserver(() => {
                autoZoom();
            });
            resizeObserver.observe(container);
        }

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };

    }, [stage, container, autoZoom]);
};