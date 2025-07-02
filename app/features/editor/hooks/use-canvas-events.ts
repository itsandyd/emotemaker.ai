import Konva from "konva";
import { useEffect } from "react";

interface UseCanvasEventsProps {
    stage: Konva.Stage | null;
    editor: any;
}

export const useCanvasEvents = ({ stage, editor }: UseCanvasEventsProps) => {
    useEffect(() => {
        if (!stage || !editor) return;

        // Only handle drag movement - let the main editor handle click events and transformers
        const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
            // Allow free dragging and update the layer
            e.target.getLayer()?.batchDraw();
        };

        stage.on('dragmove', handleDragMove);

        return () => {
            stage.off('dragmove', handleDragMove);
        };
    }, [stage, editor]);
};