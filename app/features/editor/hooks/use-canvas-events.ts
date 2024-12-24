import Konva from "konva";
import { useEffect } from "react";

interface useCanvasEventsProps {
    stage: Konva.Stage | null;
    setSelectedObjects: (objects: Konva.Node[]) => void;
    clearSelectionCallback?: () => void;
}

export const useCanvasEvents = ({ stage, setSelectedObjects, clearSelectionCallback }: useCanvasEventsProps) => {
    useEffect(() => {
        if (stage) {
            // Get the main layer where selectable objects are
            const layer = stage.findOne<Konva.Layer>('.workspace-layer');
            if (!layer) return;

            // Handle selection created
            const handleSelect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
                const target = e.target;
                if (target instanceof Konva.Transformer) return;

                // If we clicked a selectable shape
                if (target instanceof Konva.Shape || target instanceof Konva.Group) {
                    // Get or create transformer
                    let transformer = layer.findOne<Konva.Transformer>('Transformer');
                    if (!transformer) {
                        transformer = new Konva.Transformer();
                        layer.add(transformer);
                    }

                    // Update transformer nodes
                    transformer.nodes([target]);
                    setSelectedObjects([target]);
                    layer.batchDraw();
                }
            };

            // Handle selection cleared
            const handleDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
                const target = e.target;
                // Only clear if we clicked on the stage or layer (not on a shape)
                if (!(target instanceof Konva.Shape) && !(target instanceof Konva.Group)) {
                    // Remove all transformers
                    layer.find('Transformer').forEach(tr => tr.destroy());
                    setSelectedObjects([]);
                    clearSelectionCallback?.();
                    layer.batchDraw();
                }
            };

            // Attach event listeners
            stage.on('click tap', handleDeselect);
            layer.on('click tap', handleSelect);

            // Clean up
            return () => {
                stage.off('click tap');
                layer.off('click tap');
            };
        }
    }, [stage, setSelectedObjects, clearSelectionCallback]);
};