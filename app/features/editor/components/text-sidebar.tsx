import { cn } from "@/lib/utils"
import { ActiveTool, Editor, STROKE_DASH_ARRAY, STROKE_WIDTH, KonvaTextOptions } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import Konva from 'konva'

interface TextSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: Editor | undefined;
}

export const TextSidebar = ({ activeTool, onChangeActiveTool, editor }: TextSidebarProps) => {
    const onClose = () => {
        onChangeActiveTool("select")
    }

    const handleAddText = (text: string, options?: KonvaTextOptions) => {
        if (!editor?.stage) return;
        editor.setActiveLayer('text');
        
        const textNode = new Konva.Text({
            text,
            fontSize: options?.fontSize || 24,
            fontFamily: options?.fontFamily || 'Arial',
            fill: options?.fill || '#000000',
            align: options?.align || 'left',
            width: options?.width,
            fontStyle: options?.fontWeight ? 'bold' : 'normal',
            draggable: true,
            x: editor.stage.width() / 2,
            y: editor.stage.height() / 2
        });

        // Make text editable on double click
        textNode.on('dblclick dbltap', () => {
            if (!editor?.stage) return;
            
            // Create textarea over canvas
            const textPosition = textNode.getAbsolutePosition();
            const stageBox = editor.stage.container().getBoundingClientRect();
            const areaPosition = {
                x: stageBox.left + textPosition.x,
                y: stageBox.top + textPosition.y,
            };

            // Create and style textarea
            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);

            textarea.value = textNode.text();
            textarea.style.position = 'absolute';
            textarea.style.top = `${areaPosition.y}px`;
            textarea.style.left = `${areaPosition.x}px`;
            textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
            textarea.style.height = `${textNode.height() - textNode.padding() * 2}px`;
            textarea.style.fontSize = `${textNode.fontSize()}px`;
            textarea.style.border = 'none';
            textarea.style.padding = '0px';
            textarea.style.margin = '0px';
            textarea.style.overflow = 'hidden';
            textarea.style.background = 'none';
            textarea.style.outline = 'none';
            textarea.style.resize = 'none';
            textarea.style.lineHeight = textNode.lineHeight().toString();
            textarea.style.fontFamily = textNode.fontFamily();
            textarea.style.transformOrigin = 'left top';
            textarea.style.textAlign = textNode.align();
            textarea.style.color = textNode.fill() as string;

            const rotation = textNode.rotation();
            let transform = '';
            if (rotation) {
                transform += `rotateZ(${rotation}deg)`;
            }
            const px = textNode.scaleX();
            const py = textNode.scaleY();
            if (px !== 1 || py !== 1) {
                transform += ` scale(${px}, ${py})`;
            }
            textarea.style.transform = transform;

            // Focus on textarea
            textarea.focus();

            function removeTextarea() {
                textarea.parentNode?.removeChild(textarea);
                window.removeEventListener('click', handleOutsideClick);
                textNode.show();
                editor?.stage?.draw();
            }

            function setTextareaWidth(newWidth: number) {
                if (!newWidth) {
                    // set width for text length
                    newWidth = textNode.text().length * textNode.fontSize();
                }
                // some extra fixes on different browsers
                const isSafari = /^((?!chrome|android).)*safari/i.test(
                    navigator.userAgent
                );
                const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                if (isSafari || isFirefox) {
                    newWidth = Math.ceil(newWidth);
                }

                const isEdge = /Edge/.test(navigator.userAgent);
                if (isEdge) {
                    newWidth += 1;
                }
                textarea.style.width = newWidth + 'px';
            }

            textarea.addEventListener('keydown', function (e) {
                // hide on enter
                if (e.keyCode === 13 && !e.shiftKey) {
                    textNode.text(textarea.value);
                    removeTextarea();
                }
                // on esc do not set value back to node
                if (e.keyCode === 27) {
                    removeTextarea();
                }
            });

            textarea.addEventListener('keydown', function (e) {
                const scale = textNode.getAbsoluteScale().x;
                setTextareaWidth(textNode.width() * scale);
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + textNode.fontSize() + 'px';
            });

            function handleOutsideClick(e: MouseEvent) {
                if (e.target !== textarea) {
                    textNode.text(textarea.value);
                    removeTextarea();
                }
            }
            setTimeout(() => {
                window.addEventListener('click', handleOutsideClick);
            });

            textNode.hide();
            editor.stage.draw();
        });

        const layer = editor.getLayer('text');
        if (layer) {
            layer.add(textNode);
            layer.draw();
        }
    }

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "text" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Text" description="Add text to your canvas" />
            <ScrollArea>
                <div className="p-4 space-y-4 border-b">
                    <Button className="w-full" onClick={() => handleAddText("Double click to edit")}>
                        Add a textbox
                    </Button>
                    <Button className="w-full h-16" variant="secondary" onClick={() => handleAddText("Heading", {
                        fontSize: 80,
                        fontWeight: 700,
                    })}>
                        <span className="text-2xl font-bold">
                            Add a heading
                        </span>
                    </Button>
                    <Button className="w-full h-16" variant="secondary" onClick={() => handleAddText("Subheading", {
                        fontSize: 44,
                        fontWeight: 500,
                    })}>
                        <span className="text-xl font-bold">
                            Add a sub heading
                        </span>
                    </Button>
                    <Button className="w-full h-16" variant="secondary" onClick={() => handleAddText("Paragraph", {
                        fontSize: 18,
                    })}>
                        Paragraph
                    </Button>
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    )
}