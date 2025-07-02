import { cn } from "@/lib/utils"
import { ActiveTool, KonvaEditor, DEFAULT_EDITOR_STATE } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"

interface OpacitySidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: KonvaEditor | undefined;
}

export const OpacitySidebar = ({ activeTool, onChangeActiveTool, editor }: OpacitySidebarProps) => {
    const initialValue = editor?.selectedNode?.attrs?.opacity || DEFAULT_EDITOR_STATE.opacity;
    const [opacity, setOpacity] = useState(initialValue);

    useEffect(() => {
        if (editor?.selectedNode) {
            setOpacity(editor.selectedNode.attrs.opacity || DEFAULT_EDITOR_STATE.opacity);
        }
    }, [editor?.selectedNode]);

    const onClose = () => {
        onChangeActiveTool("select");
    }

    const onChange = (value: number) => {
        editor?.setOpacity(value);
        setOpacity(value);
    }

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "opacity" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Opacity" description="Change the opacity of your element" />
            <ScrollArea>
                <div className="p-4 space-y-4 border-b">
                    <Slider value={[opacity]} onValueChange={(value) => onChange(value[0])} min={0} max={1} step={0.01} />
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    )
}