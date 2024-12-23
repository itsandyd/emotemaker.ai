import { cn } from "@/lib/utils"
import { ActiveTool, KonvaEditor, DEFAULT_EDITOR_STATE } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface StrokeWidthSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: KonvaEditor | undefined;
}

export const StrokeWidthSidebar = ({ activeTool, onChangeActiveTool, editor }: StrokeWidthSidebarProps) => {
    const widthValue = editor?.selectedNode?.attrs?.strokeWidth || DEFAULT_EDITOR_STATE.strokeWidth;
    const typeValue = editor?.selectedNode?.attrs?.dashEnabled ? editor?.selectedNode?.attrs?.dash : [];

    const onClose = () => {
        onChangeActiveTool("select")
    }

    const onChangeStrokeWidth = (value: number) => {
        editor?.setStrokeWidth(value)
    }

    const onChangeStrokeType = (value: number[]) => {
        if (editor?.selectedNode) {
            editor.selectedNode.setAttr('dash', value);
            editor.selectedNode.setAttr('dashEnabled', value.length > 0);
            editor.layer?.batchDraw();
        }
    }

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "stroke-width" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Stroke options" description="Change the stroke options of your element" />
            <ScrollArea>
                <div className="p-4 space-y-4 border-b">
                    <Label className="text-sm">Stroke width</Label>
                    <Slider value={[widthValue]} onValueChange={(value) => onChangeStrokeWidth(value[0])} min={1} max={20} step={1} />
                </div>
                <div className="p-4 space-y-4 border-b">
                    <Label className="text-sm">Stroke type</Label>
                    <Button
                        onClick={() => onChangeStrokeType([])}
                        variant="secondary"
                        size="lg"
                        className={cn(
                            "w-full border-black rounded-full",
                            (!typeValue || typeValue.length === 0) && "border-4"
                        )}
                        style={{ padding: "8px 16px" }}
                    >
                        <div className="w-full border-black rounded-full border-4" />
                    </Button>
                    <Button
                        onClick={() => onChangeStrokeType([5, 5])}
                        variant="secondary"
                        size="lg"
                        className={cn(
                            "w-full border-black rounded-full",
                            (typeValue && typeValue.length > 0) && "border-4 border-blue-500"
                        )}
                        style={{ padding: "8px 16px" }}
                    >
                        <div className="w-full border-black rounded-full border-4 border-dashed" />
                    </Button>
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    )
}