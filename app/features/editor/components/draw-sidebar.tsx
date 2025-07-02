import { cn } from "@/lib/utils"
import { ActiveTool, KonvaEditor, DEFAULT_EDITOR_STATE } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface DrawSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: KonvaEditor | undefined;
}

export const DrawSidebar = ({ activeTool, onChangeActiveTool, editor }: DrawSidebarProps) => {
    const [strokeWidth, setStrokeWidth] = useState(DEFAULT_EDITOR_STATE.strokeWidth);

    const onClose = () => {
        onChangeActiveTool("select")
    }

    const onWidthChange = (value: number) => {
        if (!editor) return;
        setStrokeWidth(value);
        editor.setStrokeWidth(value);
    }

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "draw" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Drawing Mode" description="Draw on your canvas" />
            <ScrollArea>
                <div className="p-4 space-y-6 border-b">
                    <Label>Brush Width</Label>
                    <Slider 
                        value={[strokeWidth]} 
                        onValueChange={([value]) => onWidthChange(value)}
                        min={1}
                        max={50}
                        step={1}
                    />
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};