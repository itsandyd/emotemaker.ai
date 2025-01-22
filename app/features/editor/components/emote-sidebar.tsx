import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Loader, FileVideo, Image as ImageIcon } from "lucide-react";
import { Emote } from "@prisma/client";
import { ActiveTool, KonvaEditor } from "../types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";

interface EmoteSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool, options?: { tab?: "images" | "videos" }) => void;
    editor: KonvaEditor | undefined;
    emotes: Emote[] | undefined;
    setCurrentPrompt: (prompt: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const EmoteSidebar = ({ activeTool, onChangeActiveTool, editor, emotes = [], setCurrentPrompt }: EmoteSidebarProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState<"images" | "videos">("images");

    const filteredEmotes = (emotes || []).filter(emote => {
        const matchesSearch = emote.prompt?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = currentTab === "images"
            ? !emote.isVideo
            : emote.isVideo;
        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filteredEmotes.length / ITEMS_PER_PAGE);
    const paginatedEmotes = filteredEmotes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage]);

    const onClose = () => {
        onChangeActiveTool("select");
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleAddToCanvas = async (emote: Emote) => {
        try {
            if (!editor) {
                toast.error('Editor not initialized');
                return;
            }

            editor.setActiveLayer('emotes');
            if (emote.isVideo) {
                const video = await editor.addVideo(emote.imageUrl as string);
                const stage = editor.stage;
                if (stage) {
                    video.position({
                        x: stage.width() / 2,
                        y: stage.height() / 2
                    });
                    video.offsetX(video.width() / 2);
                    video.offsetY(video.height() / 2);
                    video.draggable(true);
                }
            } else {
                await editor.addImage(emote.imageUrl as string).then(() => {
                    const stage = editor.stage;
                    const layer = editor.getLayer('emotes');
                    if (stage && layer) {
                        const lastNode = layer.children[layer.children.length - 1];
                        if (lastNode) {
                            lastNode.position({
                                x: stage.width() / 2,
                                y: stage.height() / 2
                            });
                            lastNode.offsetX(lastNode.width() / 2);
                            lastNode.offsetY(lastNode.height() / 2);
                            lastNode.draggable(true);
                            layer.batchDraw();
                        }
                    }
                });
            }

            toast.success('Added to canvas');
            setCurrentPrompt(emote.prompt || '');
        } catch (error) {
            console.error('Error adding to canvas:', error);
            toast.error('Failed to add to canvas');
        }
    };

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-2 gap-4">
            {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                <Skeleton key={index} className="w-full h-[100px]" />
            ))}
        </div>
    );

    const isEditorReady = editor && editor.stage && editor.activeLayer;

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "emotes" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Emotes" description="Add emotes to your canvas" />
            <div className="p-4 space-y-4">
                <Input
                    placeholder="Search emotes..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />

                <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "images" | "videos")}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="images" className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Images
                        </TabsTrigger>
                        <TabsTrigger value="videos" className="flex items-center gap-2">
                            <FileVideo className="h-4 w-4" />
                            Videos
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                    <div className="p-4">
                        {loading ? (
                            <LoadingSkeleton />
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {paginatedEmotes.length > 0 ? (
                                    paginatedEmotes.map((emote: Emote) => (
                                        <div
                                            key={emote.id}
                                            className="relative w-full h-[100px] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                                        >
                                            {emote.isVideo ? (
                                                <video
                                                    src={emote.imageUrl as string}
                                                    className="object-cover w-full h-full"
                                                    muted
                                                    loop
                                                    onMouseOver={(e) => e.currentTarget.play()}
                                                    onMouseOut={(e) => e.currentTarget.pause()}
                                                />
                                            ) : (
                                                <img
                                                    src={emote.imageUrl as string}
                                                    alt={emote.prompt || emote.id}
                                                    className="object-cover w-full h-full"
                                                />
                                            )}
                                            <button
                                                onClick={() => handleAddToCanvas(emote)}
                                                disabled={!isEditorReady || loading}
                                                className={cn(
                                                    "absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition bg-black bg-opacity-50 flex items-center justify-center text-white",
                                                    (!isEditorReady || loading) ? "cursor-wait" : "cursor-pointer"
                                                )}
                                            >
                                                {loading ? (
                                                    <Loader className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    'Add to Canvas'
                                                )}
                                            </button>
                                            {emote.isVideo && (
                                                <div className="absolute top-2 right-2">
                                                    <FileVideo className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2">
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                onChangeActiveTool("emote-generator", { 
                                                    tab: currentTab 
                                                });
                                            }}
                                        >
                                            {currentTab === "videos" ? "Generate a Video" : "Generate an Image"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 flex justify-between items-center border-t">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};