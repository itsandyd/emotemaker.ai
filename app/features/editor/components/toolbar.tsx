"use client"

import { useState, useEffect } from "react";
import { ActiveTool, KonvaEditor, VideoObject } from "../types"
import { AlignRight, ArrowDown, ArrowUp, ChevronDown, DownloadCloud, EraserIcon, FrameIcon, PaintBucket, PictureInPicture, PictureInPicture2, Save, Scissors, Trash2 } from "lucide-react";
import { BsBorderWidth } from "react-icons/bs";
import { RxTransparencyGrid } from "react-icons/rx";
import { TbColorFilter } from "react-icons/tb";
import { Loader2 } from "lucide-react";
import { Emote } from "@prisma/client";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { VideoTimeline } from "./video-timeline";

interface ToolbarProps {
    editor: KonvaEditor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    addEmote: (newEmote: Emote) => void;
    currentPrompt: string;
}

export const Toolbar = ({ editor, activeTool, onChangeActiveTool, addEmote, currentPrompt }: ToolbarProps) => {
    const { userId } = useAuth();
    const [isRemovingBackground, setIsRemovingBackground] = useState(false);
    const [isSavingEmote, setIsSavingEmote] = useState(false);
    const [isDownloadingEmote, setIsDownloadingEmote] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);

    const selectedNode = editor?.selectedNode;
    const fillColor = selectedNode?.attrs?.fill;
    const strokeColor = selectedNode?.attrs?.stroke;
    const fontFamily = selectedNode?.attrs?.fontFamily;

    const isText = selectedNode?.attrs?.text !== undefined;
    const isImage = selectedNode?.attrs?.image !== undefined;
    const isVideo = selectedNode && editor?.isVideoObject(selectedNode);

    console.log('Selected node:', selectedNode);
    console.log('Is video:', isVideo);
    console.log('Editor:', editor);
    console.log('Video methods:', {
        startTime: editor?.getVideoStartTime(),
        endTime: editor?.getVideoEndTime(),
        duration: editor?.getVideoDuration()
    });

    useEffect(() => {
        if (editor && editor.selectedNode && editor.isVideoObject(editor.selectedNode)) {
            setStartTime(editor.getVideoStartTime());
            setEndTime(editor.getVideoEndTime());
        }
    }, [editor?.selectedNode, editor]);

    if (!selectedNode) {
        return (
            <div className="shrink-0 h-[56px] border-b border-gray-300 bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2" />
        )
    }

    return (
        <div className="shrink-0 h-[62px] border-b border-gray-300 bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2" >
            {isVideo && editor && (
                <>
                    <div className="flex-1 h-full flex items-center px-2">
                        <VideoTimeline
                            videoElement={(editor.selectedNode as VideoObject).getVideoElement()}
                            startTime={startTime}
                            endTime={endTime}
                            duration={editor.getVideoDuration()}
                            onStartTimeChange={(value) => {
                                setStartTime(value);
                                if (editor.selectedNode && editor.isVideoObject(editor.selectedNode)) {
                                    editor.selectedNode.setStartTime(value);
                                }
                            }}
                            onEndTimeChange={(value) => {
                                setEndTime(value);
                                if (editor.selectedNode && editor.isVideoObject(editor.selectedNode)) {
                                    editor.selectedNode.setEndTime(value);
                                }
                            }}
                        />
                    </div>
                    <div className="flex items-center h-full justify-center">
                        <Hint label="Download Trimmed Video" side="bottom" sideOffset={5}>
                            <Button
                                onClick={async () => {
                                    try {
                                        await editor.downloadTrimmedVideo();
                                    } catch (error) {
                                        console.error('Failed to download trimmed video:', error);
                                        toast.error('Failed to download trimmed video');
                                    }
                                }}
                                size="icon"
                                variant="ghost"
                            >
                                <Scissors className="size-4" />
                            </Button>
                        </Hint>
                    </div>
                </>
            )}
            {!isImage && !isVideo && (
                <div className="flex items-center h-full justify-center">
                    <Hint label="Color" side="bottom" sideOffset={5}>
                        <Button
                            onClick={() => onChangeActiveTool("fill")}
                            size="icon"
                            variant="ghost"
                            className={cn(activeTool === "fill" && "bg-gray-100")}
                        >
                            <div className="w-10 h-10 border rounded-md" style={{ backgroundColor: fillColor || "transparent" }} />
                        </Button>
                    </Hint>
                </div>
            )}
            {!isText && (
                <div className="flex items-center h-full justify-center">
                    <Hint label="Stroke color" side="bottom" sideOffset={5}>
                        <Button
                            onClick={() => onChangeActiveTool("stroke")}
                            size="icon"
                            variant="ghost"
                            className={cn(activeTool === "stroke" && "bg-gray-100")}
                        >
                            <div className="w-10 h-10 border-4 rounded-md" style={{ borderColor: strokeColor || "transparent" }} />
                        </Button>
                    </Hint>
                </div>
            )}
            {!isText && (
                <div className="flex items-center h-full justify-center">
                    <Hint label="Stroke width" side="bottom" sideOffset={5}>
                        <Button
                            onClick={() => onChangeActiveTool("stroke-width")}
                            size="icon"
                            variant="ghost"
                            className={cn(activeTool === "stroke-width" && "bg-gray-100")}
                        >
                            <BsBorderWidth className="size-4" />
                        </Button>
                    </Hint>
                </div>
            )}
            {isText && (
                <div className="flex items-center h-full justify-center">
                    <Hint label="Font" side="bottom" sideOffset={5}>
                        <Button
                            onClick={() => onChangeActiveTool("font")}
                            size="icon"
                            variant="ghost"
                            className={cn("w-auto px-2 text-sm", activeTool === "font" && "bg-gray-100")}
                        >
                            <div className="max-w-[100px] truncate">
                                {fontFamily}
                            </div>
                            <ChevronDown className="size-4 ml-2 shrink-0"/>
                        </Button>
                    </Hint>
                </div>
            )}
            <div className="flex items-center h-full justify-center">
                <Hint label="Bring forward" side="bottom" sideOffset={5}>
                    <Button
                        onClick={() => editor?.bringForward()}
                        size="icon"
                        variant="ghost"
                    >
                        <ArrowUp className="size-4"/>
                    </Button>
                </Hint>
            </div>
            <div className="flex items-center h-full justify-center">
                <Hint label="Send backwards" side="bottom" sideOffset={5}>
                    <Button
                        onClick={() => editor?.sendBackward()}
                        size="icon"
                        variant="ghost"
                    >
                        <ArrowDown className="size-4"/>
                    </Button>
                </Hint>
            </div>
            <div className="flex items-center h-full justify-center">
                <Hint label="Opacity" side="bottom" sideOffset={5}>
                    <Button
                        onClick={() => onChangeActiveTool("opacity")}
                        size="icon"
                        variant="ghost"
                        className={cn(activeTool === "opacity" && "bg-gray-100")}
                    >
                        <RxTransparencyGrid className="size-4"/>
                    </Button>
                </Hint>
            </div>
            <div className="flex items-center h-full justify-center">
                <Hint label="Delete" side="bottom" sideOffset={5}>
                    <Button
                        onClick={() => editor?.removeSelected()}
                        size="icon"
                        variant="ghost"
                    >
                        <Trash2 className="size-4"/>
                    </Button>
                </Hint>
            </div>
            {isImage && (
                <div className="flex items-center h-full justify-center">
                    <Hint label="Filter" side="bottom" sideOffset={5}>
                        <Button
                            onClick={() => onChangeActiveTool("filter")}
                            size="icon"
                            variant="ghost"
                            className={cn(activeTool === "filter" && "bg-gray-100")}
                        >
                            <TbColorFilter className="size-4"/>
                        </Button>
                    </Hint>
                </div>
            )}
            {isImage && (
                <div className="flex items-center h-full justify-center">
                    <Hint label="Remove Background" side="bottom" sideOffset={5}>
                        <Button
                            onClick={async () => {
                                setIsRemovingBackground(true);
                                try {
                                    await editor?.removeBackground();
                                } finally {
                                    setIsRemovingBackground(false);
                                }
                            }}
                            size="sm"
                            variant="ghost"
                            disabled={isRemovingBackground}
                        >
                            {isRemovingBackground ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <EraserIcon className="size-4" />
                            )}
                        </Button>
                    </Hint>
                </div>
            )}
            <div className="flex items-center h-full justify-center">
                <Hint label="Download Emote" side="bottom" sideOffset={5}>
                    <Button
                        onClick={async () => {
                            setIsDownloadingEmote(true);
                            try {
                                await editor?.download();
                            } finally {
                                setIsDownloadingEmote(false);
                            }
                        }}
                        size="icon"
                        variant="ghost"
                        disabled={isDownloadingEmote}
                    >
                        {isDownloadingEmote ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <DownloadCloud className="size-4" />
                        )}
                    </Button>
                </Hint>
            </div>
            <div className="flex items-center h-full justify-center">
                <Hint label="Save Emote" side="bottom" sideOffset={5}>
                    <Button
                        onClick={async () => {
                            setIsSavingEmote(true);
                            try {
                                if (!editor) {
                                    throw new Error('Editor is not initialized');
                                }
                                if (!userId) {
                                    throw new Error('User is not authenticated');
                                }

                                let savedEmote;
                                if (isVideo && editor.selectedNode && editor.isVideoObject(editor.selectedNode)) {
                                    // Download the trimmed video first
                                    await editor.downloadTrimmedVideo();
                                    // For now, we'll use the original video URL
                                    const videoUrl = editor.selectedNode.getVideoElement().src;
                                    if (!videoUrl) {
                                        throw new Error('Failed to get video URL');
                                    }
                                    // Save the video as an emote with isVideo flag
                                    const response = await fetch('/api/saveemote', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            prompt: currentPrompt,
                                            imageUrl: videoUrl,
                                            isVideo: true,
                                        }),
                                    });
                                    savedEmote = await response.json();
                                } else {
                                    // For regular emotes, use the existing saveEmote method
                                    savedEmote = await editor.saveEmote(currentPrompt, userId);
                                }

                                if (savedEmote) {
                                    addEmote(savedEmote);
                                    toast.success('Emote saved successfully');
                                } else {
                                    throw new Error('Failed to save emote');
                                }
                            } catch (error) {
                                console.error('Failed to save emote:', error);
                                toast.error(`Failed to save emote: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            } finally {
                                setIsSavingEmote(false);
                            }
                        }}
                        size="icon"
                        variant="ghost"
                        disabled={isSavingEmote || !userId}
                    >
                        {isSavingEmote ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                    </Button>
                </Hint>
            </div>
        </div>
    )
}