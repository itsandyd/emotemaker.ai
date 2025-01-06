import Konva from "konva";
import { useEffect, useState } from "react";

interface UseCanvasEventsProps {
    stage: Konva.Stage | null;
    editor: any;
}

export const useCanvasEvents = ({ stage, editor }: UseCanvasEventsProps) => {
    const [transformer] = useState(() => new Konva.Transformer());

    useEffect(() => {
        if (!stage || !editor) return;

        const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
            // Clear selection if clicking on empty space
            if (e.target === stage) {
                transformer.nodes([]);
                return;
            }

            // Check if target is selectable (Image, Text, or Shape)
            const target = e.target;
            if (!(target instanceof Konva.Image) && 
                !(target instanceof Konva.Text) && 
                !(target instanceof Konva.Shape)) {
                return;
            }

            // Don't select background elements
            if (target.hasName('background')) {
                transformer.nodes([]);
                return;
            }

            // Add transformer to the target's layer
            const targetLayer = target.getLayer();
            if (!targetLayer) return;

            // Check if transformer is already in this layer
            if (!targetLayer.find((node: Konva.Node) => node === transformer).length) {
                transformer.remove(); // Remove from previous layer if any
                targetLayer.add(transformer);
            }

            transformer.nodes([target]);
            targetLayer.batchDraw();
        };

        // Handle stage click for deselection
        stage.on('click', handleClick);

        return () => {
            stage.off('click', handleClick);
            transformer.remove();
        };
    }, [stage, editor, transformer]);
};