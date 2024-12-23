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
    onChangeActiveTool: (tool: ActiveTool) => void;
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
            ? !emote.videoUrl 
            : emote.videoUrl;
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
        if (!editor || !editor.stage || !editor.layer) {
            toast.error('Editor is not ready. Please try again in a moment.');
            return;
        }
        
        try {
            setLoading(true);
            console.log('Adding emote to canvas:', emote);
            
            if (emote.videoUrl) {
                console.log('Adding video:', emote.videoUrl);
                await editor.addVideo(emote.videoUrl);
                toast.success('Video added to canvas');
            } else if (emote.imageUrl) {
                console.log('Adding image:', emote.imageUrl);
                await editor.addImage(emote.imageUrl);
                toast.success('Image added to canvas');
            } else {
                throw new Error('No media URL available');
            }
        } catch (error) {
            console.error('Error adding to canvas:', error);
            toast.error('Failed to add to canvas. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-2 gap-4">
            {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                <Skeleton key={index} className="w-full h-[100px]" />
            ))}
        </div>
    );

    const isEditorReady = editor && editor.stage && editor.layer;

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
            <ScrollArea className="flex-grow">
                <div className="p-4">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {paginatedEmotes.map((emote: Emote) => (
                                <div 
                                    key={emote.id} 
                                    className="relative w-full h-[100px] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                                >
                                    {emote.videoUrl ? (
                                        <video
                                            src={emote.videoUrl}
                                            className="object-cover w-full h-full"
                                            muted
                                            loop
                                            onMouseOver={(e) => e.currentTarget.play()}
                                            onMouseOut={(e) => e.currentTarget.pause()}
                                        />
                                    ) : (
                                        <img
                                            src={emote.imageUrl!}
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
                                    {emote.videoUrl && (
                                        <div className="absolute top-2 right-2">
                                            <FileVideo className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 flex justify-between items-center">
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
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};