import Konva from "konva";
import { useEffect, useState } from "react";

interface UseCanvasEventsProps {
    stage: Konva.Stage | null;
    editor: any;
}

export const useCanvasEvents = ({ stage, editor }: UseCanvasEventsProps) => {
    const [transformer] = useState(() => new Konva.Transformer({
        borderStroke: '#0096FF',
        borderStrokeWidth: 1,
        anchorStroke: '#0096FF',
        anchorFill: '#fff',
        anchorSize: 8,
        rotateEnabled: true,
        keepRatio: false
    }));

    useEffect(() => {
        if (!stage || !editor) return;

        const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
            // Clear selection if clicking on empty space
            if (e.target === stage) {
                transformer.nodes([]);
                editor.setSelectedNode(null);
                return;
            }

            // Check if target is selectable
            const target = e.target;
            if (target.hasName('background')) {
                transformer.nodes([]);
                editor.setSelectedNode(null);
                return;
            }

            // Make target draggable and add transformer
            target.draggable(true);
            
            // Add transformer to the target's layer
            const targetLayer = target.getLayer();
            if (!targetLayer) return;

            if (!targetLayer.find((node: Konva.Node) => node === transformer).length) {
                transformer.remove();
                targetLayer.add(transformer);
            }

            transformer.nodes([target]);
            editor.setSelectedNode(target);
            targetLayer.batchDraw();
        };

        // Remove drag bounds
        const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
            // No bounds checking - allow free dragging
            e.target.getLayer()?.batchDraw();
        };

        stage.on('click tap', handleClick);
        stage.on('dragmove', handleDragMove);

        return () => {
            stage.off('click tap', handleClick);
            stage.off('dragmove', handleDragMove);
            transformer.remove();
        };
    }, [stage, editor, transformer]);
};