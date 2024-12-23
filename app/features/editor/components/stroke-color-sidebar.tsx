import { cn } from "@/lib/utils"
import { ActiveTool, KonvaEditor, DEFAULT_EDITOR_STATE } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ColorPicker } from "./color-picker"

interface StrokeColorSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: KonvaEditor | undefined;
}

export const StrokeColorSidebar = ({ activeTool, onChangeActiveTool, editor }: StrokeColorSidebarProps) => {
    const value = editor?.selectedNode?.attrs?.stroke || DEFAULT_EDITOR_STATE.strokeColor;

    const onClose = () => {
        onChangeActiveTool("select")
    }

    const onChange = (value: string) => {
        editor?.setStrokeColor(value)
    }

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "stroke" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Stroke color" description="Change the stroke color of your element" />
            <ScrollArea>
                <div className="p-4 space-y-6">
                    <ColorPicker 
                        value={value}
                        onChange={onChange}
                    />
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    )
}