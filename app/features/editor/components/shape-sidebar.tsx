import { cn } from "@/lib/utils"
import { ActiveTool, KonvaEditor, ShapeType } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShapeTool } from "./shape-tool"
import { FaCircle, FaSquare, FaSquareFull } from "react-icons/fa"
import { IoTriangle } from "react-icons/io5"
import { FaDiamond } from "react-icons/fa6"

interface ShapeSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: KonvaEditor | undefined;
}

export const ShapeSidebar = ({ activeTool, onChangeActiveTool, editor }: ShapeSidebarProps) => {
    const onClose = () => {
        onChangeActiveTool("select")
    }

    const handleAddShape = (type: ShapeType) => {
        if (!editor) return;
        editor.setActiveLayer('shapes');
        editor.addShape(type);
    }

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[360px] h-full flex flex-col", activeTool === "shapes" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Shapes" description="Add shapes to your canvas" />
            <ScrollArea>
                <div className="grid grid-cols-3 gap-4 p-4">
                    <ShapeTool 
                        onClick={() => handleAddShape('circle')}
                        icon={FaCircle}
                    />
                    <ShapeTool 
                        onClick={() => handleAddShape('rectangle')}
                        icon={FaSquare}
                    />
                    <ShapeTool 
                        onClick={() => handleAddShape('rectangle')}
                        icon={FaSquareFull}
                    />
                    <ShapeTool 
                        onClick={() => handleAddShape('triangle')}
                        icon={IoTriangle}
                    />
                    <ShapeTool 
                        onClick={() => handleAddShape('inverseTriangle')}
                        icon={IoTriangle}
                        iconClassName="rotate-180"
                    />
                    <ShapeTool 
                        onClick={() => handleAddShape('diamond')}
                        icon={FaDiamond}
                    /> 
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    )
}