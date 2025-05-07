"use client"

import { useState, useEffect, useMemo } from "react";
import { ActiveTool, KonvaEditor, VideoObject } from "../types"
import { AlignRight, ArrowDown, ArrowUp, ChevronDown, DownloadCloud, EraserIcon, FrameIcon, PaintBucket, PictureInPicture, PictureInPicture2, Save, Scissors, Trash2, Download, Undo, Redo, Pause, Play, Lock } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Konva from "konva";

interface ToolbarProps {
    editor: KonvaEditor | null;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    addEmote: (emote: Emote) => void;
    currentPrompt: string;
    subscriptionType?: string | null;
    isActiveSubscriber?: boolean;
}

export const Toolbar = ({
    editor,
    activeTool,
    onChangeActiveTool,
    addEmote,
    currentPrompt,
    subscriptionType = null,
    isActiveSubscriber = false
}: ToolbarProps) => {
    const { userId } = useAuth();
    const [isRemovingBackground, setIsRemovingBackground] = useState(false);
    const [isSavingEmote, setIsSavingEmote] = useState(false);
    const [isDownloadingEmote, setIsDownloadingEmote] = useState(false);
    const [isDownloadingGif, setIsDownloadingGif] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);

    const selectedNode = editor?.selectedNode;
    const fillColor = selectedNode?.attrs?.fill;
    const strokeColor = selectedNode?.attrs?.stroke;
    const fontFamily = selectedNode?.attrs?.fontFamily;

    const isText = selectedNode?.attrs?.text !== undefined;
    const isImage = selectedNode?.attrs?.image !== undefined;
    const isVideo = selectedNode && editor?.isVideoObject(selectedNode);
    const hasAnimation = selectedNode && editor?.getAnimation(selectedNode);

    console.log('Selected node:', selectedNode);
    console.log('Is video:', isVideo);
    console.log('Has animation:', hasAnimation);
    console.log('Animation data:', selectedNode?.attrs?.animation);
    console.log('Editor:', editor);
    console.log('Video methods:', {
        startTime: editor?.getVideoStartTime(),
        endTime: editor?.getVideoEndTime(),
        duration: editor?.getVideoDuration()
    });

    useEffect(() => {
        if (editor && editor.selectedNode && editor.isVideoObject(editor.selectedNode)) {
            const videoDuration = editor.selectedNode.attrs.duration || 
                                editor.selectedNode.attrs.videoElement?.duration || 
                                editor.getVideoDuration();
            
            const start = Math.max(0, editor.getVideoStartTime());
            const end = Math.min(videoDuration, editor.getVideoEndTime());
            
            setStartTime(start);
            setEndTime(end);
            
            // Ensure video element has correct times
            const videoElement = editor.selectedNode.attrs.videoElement;
            if (videoElement) {
                videoElement.currentTime = start;
                if (editor.selectedNode.attrs.isPlaying) {
                    videoElement.play().catch(console.error);
                }
            }
        }
    }, [editor?.selectedNode, editor]);

    // Add an additional effect to handle changes to the timeline
    useEffect(() => {
        if (editor && editor.selectedNode && editor.isVideoObject(editor.selectedNode)) {
            // Update the timeline whenever start/end times change in the editor
            const videoObj = editor.selectedNode;
            const newStart = videoObj.attrs.startTime;
            const newEnd = videoObj.attrs.endTime;
            
            if (newStart !== undefined && newStart !== startTime) {
                setStartTime(newStart);
            }
            
            if (newEnd !== undefined && newEnd !== endTime) {
                setEndTime(newEnd);
            }
        }
    }, [editor, startTime, endTime, editor?.selectedNode?.attrs?.startTime, editor?.selectedNode?.attrs?.endTime]);

    // Check if user has premium download permissions
    const hasPremiumDownload = useMemo(() => {
        // Only allow Premium, Standard, and Legacy subscribers to download full resolution
        return isActiveSubscriber && 
               (subscriptionType === 'PREMIUM' || // Team plan
                subscriptionType === 'STANDARD' || // Pro plan
                subscriptionType === 'LEGACY');    // Old plan
    }, [isActiveSubscriber, subscriptionType]);

    if (!selectedNode) {
        return (
            <div className="shrink-0 h-[62px] border-b border-gray-300 bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2" />
        )
    }

    return (
        <div className="shrink-0 h-[62px] border-b border-gray-300 bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2" >
            <div className="flex items-center h-full justify-center gap-x-1">
                <Hint label="Undo" side="bottom" sideOffset={5}>
                    <Button
                        onClick={() => editor?.undo()}
                        size="icon"
                        variant="ghost"
                    >
                        <Undo className="size-4" />
                    </Button>
                </Hint>
                <Hint label="Redo" side="bottom" sideOffset={5}>
                    <Button
                        onClick={() => editor?.redo()}
                        size="icon"
                        variant="ghost"
                    >
                        <Redo className="size-4" />
                    </Button>
                </Hint>
            </div>
            {isVideo && editor && (
                <>
                    <div className="flex-1 h-full flex items-center px-2">
                        <VideoTimeline
                            videoElement={(editor.selectedNode as VideoObject).attrs.videoElement}
                            startTime={startTime}
                            endTime={endTime}
                            duration={editor.getVideoDuration()}
                            onStartTimeChange={editor.setVideoStartTime}
                            onEndTimeChange={editor.setVideoEndTime}
                            onTimeUpdate={(time) => {
                                const video = (editor.selectedNode as VideoObject).attrs.videoElement;
                                if (video) {
                                    video.currentTime = time;
                                }
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-2 px-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                const videoObj = editor.selectedNode as VideoObject;
                                const video = videoObj.attrs.videoElement;
                                if (video) {
                                    if (video.paused) {
                                        video.play();
                                        videoObj.attrs.isPlaying = true;
                                    } else {
                                        video.pause();
                                        videoObj.attrs.isPlaying = false;
                                    }
                                }
                            }}
                        >
                            {(editor.selectedNode as VideoObject).attrs.isPlaying ? (
                                <Pause className="h-4 w-4" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </Button>
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            disabled={isDownloadingEmote || isDownloadingGif}
                        >
                            {isDownloadingEmote || isDownloadingGif ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <DownloadCloud className="size-4" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={async () => {
                                if (!hasPremiumDownload) {
                                    toast.error('Premium subscription required for full-size downloads');
                                    return;
                                }
                                setIsDownloadingEmote(true);
                                try {
                                    await editor?.download();
                                } finally {
                                    setIsDownloadingEmote(false);
                                }
                            }}
                            disabled={isDownloadingEmote || isDownloadingGif}
                            className={!hasPremiumDownload ? "opacity-50" : ""}
                        >
                            {hasPremiumDownload ? (
                                <Download className="size-4 mr-2" />
                            ) : (
                                <Lock className="size-4 mr-2" />
                            )}
                            Download as PNG {!hasPremiumDownload && "(Premium)"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={async () => {
                                setIsDownloadingEmote(true);
                                try {
                                    await editor?.downloadForDiscord();
                                } finally {
                                    setIsDownloadingEmote(false);
                                }
                            }}
                            disabled={isDownloadingEmote || isDownloadingGif}
                        >
                            <Download className="size-4 mr-2" />
                            Discord (128x128)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={async () => {
                                setIsDownloadingEmote(true);
                                try {
                                    await editor?.downloadForTwitchSmall();
                                } finally {
                                    setIsDownloadingEmote(false);
                                }
                            }}
                            disabled={isDownloadingEmote || isDownloadingGif}
                        >
                            <Download className="size-4 mr-2" />
                            Twitch Small (28x28)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={async () => {
                                setIsDownloadingEmote(true);
                                try {
                                    await editor?.downloadForTwitchMedium();
                                } finally {
                                    setIsDownloadingEmote(false);
                                }
                            }}
                            disabled={isDownloadingEmote || isDownloadingGif}
                        >
                            <Download className="size-4 mr-2" />
                            Twitch Medium (56x56)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={async () => {
                                setIsDownloadingEmote(true);
                                try {
                                    await editor?.downloadForTwitchLarge();
                                } finally {
                                    setIsDownloadingEmote(false);
                                }
                            }}
                            disabled={isDownloadingEmote || isDownloadingGif}
                        >
                            <Download className="size-4 mr-2" />
                            Twitch Large (112x112)
                        </DropdownMenuItem>
                        {selectedNode && editor?.getAnimation(selectedNode) && (
                            <DropdownMenuItem
                                onClick={async () => {
                                    try {
                                        setIsDownloadingGif(true);
                                        await editor?.downloadAsGif();
                                    } catch (error) {
                                        console.error('Error downloading GIF:', error);
                                        toast.error('Failed to download GIF');
                                    } finally {
                                        setIsDownloadingGif(false);
                                    }
                                }}
                                disabled={isDownloadingEmote || isDownloadingGif}
                            >
                                <FrameIcon className="size-4 mr-2" />
                                Download as GIF
                            </DropdownMenuItem>
                        )}
                        {isVideo && (
                            <DropdownMenuItem
                                onClick={async () => {
                                    setIsDownloadingEmote(true);
                                    try {
                                        await editor?.downloadTrimmedVideo();
                                    } catch (error) {
                                        console.error('Failed to download trimmed video:', error);
                                        toast.error('Failed to download trimmed video');
                                    } finally {
                                        setIsDownloadingEmote(false);
                                    }
                                }}
                                disabled={isDownloadingEmote || isDownloadingGif}
                            >
                                <Scissors className="size-4 mr-2" />
                                Download Trimmed Video
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
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
                                    console.log('Video node attributes:', editor.selectedNode.attrs);
                                    // Get the video node, handling the case where we might have selected the image inside the group
                                    const videoNode = editor.selectedNode instanceof Konva.Image && editor.selectedNode.parent?.getAttr('objectType') === 'video'
                                        ? editor.selectedNode.parent
                                        : editor.selectedNode;
                                    
                                    const videoElement = videoNode.getAttr('videoElement') as HTMLVideoElement;
                                    if (!videoElement) {
                                        throw new Error('Video element not found');
                                    }
                                    const videoUrl = videoElement.src;
                                    if (!videoUrl) {
                                        throw new Error('Video URL not found');
                                    }
                                    console.log('Found video URL:', videoUrl);
                                    // Save the video as an emote with isVideo flag
                                    const response = await fetch('/api/saveemote', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            prompt: currentPrompt,
                                            imageUrl: videoUrl,
                                            style: "custom",
                                            model: "canvas",
                                            isVideo: true,
                                        }),
                                    });
                                    if (!response.ok) {
                                        throw new Error('Failed to save video emote');
                                    }
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
};