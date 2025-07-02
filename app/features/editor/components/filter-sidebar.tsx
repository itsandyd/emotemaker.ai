import { cn } from "@/lib/utils"
import { ActiveTool, KonvaEditor, FilterType, filters } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface FilterSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: KonvaEditor | undefined;
}

export const FilterSidebar = ({ activeTool, onChangeActiveTool, editor }: FilterSidebarProps) => {
    const onClose = () => {
        onChangeActiveTool("select")
    }

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "filter" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Filters" description="Apply filters to your image" />
            <ScrollArea>
                <div className="p-4 space-y-4 border-b">
                    {filters.map((filter) => (
                        <Button 
                            key={filter} 
                            className={cn(
                                "w-full h-16 justify-start text-left"
                            )}
                            size="lg"
                            variant="secondary"
                            onClick={() => editor?.changeImageFilter(filter)}
                        >
                            {filter}
                        </Button>
                    ))}
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    )
}