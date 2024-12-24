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

        // Find the workspace layer (assuming it's the first layer)
        const layer = stage.findOne<Konva.Layer>('.workspace-layer');
        if (!layer) return;

        // Find the clip/workspace shape
        const workspace = layer.findOne<Konva.Shape>('.clip');
        if (!workspace) return;

        // Calculate scale to fit
        const scaleX = width / workspace.width();
        const scaleY = height / workspace.height();
        const scale = Math.min(scaleX, scaleY) * 0.85; // 0.85 is the zoom ratio

        // Get workspace dimensions
        const workspaceWidth = workspace.width() * scale;
        const workspaceHeight = workspace.height() * scale;

        // Center the workspace
        const x = (width - workspaceWidth) / 2;
        const y = (height - workspaceHeight) / 2;

        // Reset and apply new transform
        layer.scale({ x: scale, y: scale });
        layer.position({ x, y });
        layer.batchDraw();

        // Update clip path if needed
        const clipLayer = stage.findOne<Konva.Layer>('.clip-layer');
        if (clipLayer) {
            clipLayer.scale({ x: scale, y: scale });
            clipLayer.position({ x, y });
            clipLayer.batchDraw();
        }

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