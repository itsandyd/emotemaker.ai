import { cn } from "@/lib/utils"
import { ActiveTool, KonvaEditor, DEFAULT_EDITOR_STATE } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ColorPicker } from "./color-picker"

interface FillColorSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: KonvaEditor | undefined;
}

export const FillColorSidebar = ({ activeTool, onChangeActiveTool, editor }: FillColorSidebarProps) => {
    const value = editor?.selectedNode?.attrs?.fill || DEFAULT_EDITOR_STATE.fillColor;

    const onClose = () => {
        onChangeActiveTool("select")
    }

    const onChange = (value: string) => {
        editor?.setFillColor(value)
    }

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "fill" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Fill color" description="Add fill color to your element" />
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