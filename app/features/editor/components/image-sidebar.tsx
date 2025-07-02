import { cn } from "@/lib/utils"
import { ActiveTool, Editor, fonts, STROKE_DASH_ARRAY, STROKE_WIDTH } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
// import { useGetImages } from "../../images/api/use-get-images"
import { AlertTriangle, Loader } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { UploadButton } from "@uploadthing/react"
import { FileUpload } from "@/components/FileUpload"


interface ImageSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: Editor | undefined;
}

export const ImageSidebar = ({ activeTool, onChangeActiveTool, editor }: ImageSidebarProps) => {
    // const { data, isLoading, isError } = useGetImages()

    const onClose = () => {
        onChangeActiveTool("select")
    }

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "images" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Images" description="Add images to your canvas" />
            {/* {isLoading && (
                <div className="flex items-center justify-center flex-1">
                    <Loader className="size-4 text-muted-foreground animate-spin" />
                </div>
            )}
            {isError && (
                <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
                    <AlertTriangle className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-xs">Failed to fetch images</p>
                </div>
            )} */}
            <div className="p-4 border-b border-muted">
                <FileUpload 
                    endpoint="imageUploader" 
                    onChange={(res: any) => editor?.addImage(res[0].url)} 
                />
            </div>
            <ScrollArea>
                <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                    {/* {data && data.images.map((image) => {
                        return (
                            <button 
                                key={image.id} 
                                className="relative w-full h-[100px] group hover:opacity-75 transition bg-muted rounded-sm overflw-hidden border"
                                onClick={() => editor?.addImage(image.urls.regular)}
                            >
                                <img 
                                    src={image.urls.small} 
                                    alt={image.alt_description || ""} 
                                    className="object-cover w-full h-full"
                                />
                                <Link 
                                    href={image.links.html}
                                    target="_blank"
                                    className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50 text-left"
                                >
                                    {image.user.name}
                                </Link>
                            </button>
                        )
                    })} */}
                    </div>
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    )
}