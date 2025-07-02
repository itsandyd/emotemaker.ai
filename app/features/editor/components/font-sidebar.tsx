import { cn } from "@/lib/utils"
import { ActiveTool, KonvaEditor, DEFAULT_EDITOR_STATE } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

// Common web-safe fonts
const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Times',
    'Courier New',
    'Courier',
    'Verdana',
    'Georgia',
    'Palatino',
    'Garamond',
    'Bookman',
    'Comic Sans MS',
    'Trebuchet MS',
    'Impact'
];

interface FontSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: KonvaEditor | undefined;
}

export const FontSidebar = ({ activeTool, onChangeActiveTool, editor }: FontSidebarProps) => {
    const value = editor?.selectedNode?.attrs?.fontFamily || DEFAULT_EDITOR_STATE.fontFamily;

    const onClose = () => {
        onChangeActiveTool("select")
    }

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "font" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Font" description="Change the font of your text" />
            <ScrollArea>
                <div className="p-4 space-y-4 border-b">
                    {fonts.map((font) => (
                        <Button 
                            key={font} 
                            className={cn(
                                "w-full h-16 justify-start text-left", 
                                value === font && "border-4 border-blue-500"
                            )}
                            size="lg"
                            variant="secondary"
                            style={{
                                fontFamily: font,
                                fontSize: "16px",
                                padding: "8px 16px",
                            }}
                            onClick={() => editor?.setFontFamily(font)}
                        >
                            {font}
                        </Button>
                    ))}
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    )
}