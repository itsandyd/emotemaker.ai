import React, { useEffect, useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
    Play, 
    Pause, 
    SkipBack, 
    SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTimelineProps {
    videoElement: HTMLVideoElement;
    onTimeUpdate?: (startTime: number, endTime: number) => void;
    compact?: boolean;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({ 
    videoElement,
    onTimeUpdate,
    compact = false
}) => {
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    
    useEffect(() => {
        const handleLoadedMetadata = () => {
            setDuration(videoElement.duration);
            setEndTime(videoElement.duration);
        };
        
        const handleTimeUpdate = () => {
            setCurrentTime(videoElement.currentTime);
            
            if (videoElement.currentTime >= endTime) {
                videoElement.currentTime = startTime;
            }
        };
        
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        
        return () => {
            videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [videoElement, endTime, startTime]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            videoElement.pause();
        } else {
            videoElement.play();
            if (videoElement.currentTime < startTime || videoElement.currentTime > endTime) {
                videoElement.currentTime = startTime;
            }
        }
        setIsPlaying(!isPlaying);
    };

    const handleTrimChange = (values: number[]) => {
        const [newStartTime, newEndTime] = values;
        setStartTime(newStartTime);
        setEndTime(newEndTime);
        
        if (videoElement.currentTime < newStartTime || videoElement.currentTime > newEndTime) {
            videoElement.currentTime = newStartTime;
        }
        
        onTimeUpdate?.(newStartTime, newEndTime);
    };

    return (
        <div className={cn(
            "bg-white rounded-lg shadow",
            compact ? "p-2" : "p-4",
            "backdrop-blur-lg bg-opacity-90"
        )}>
            <div className={cn("space-y-2", compact ? "space-y-1" : "space-y-4")}>
                <div className="relative">
                    <Slider
                        defaultValue={[0, duration]}
                        value={[startTime, endTime]}
                        max={duration}
                        step={0.1}
                        className={cn("mt-2", compact ? "h-3" : "h-4")}
                        onValueChange={handleTrimChange}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatTime(startTime)}</span>
                        <span>{formatTime(endTime)}</span>
                    </div>
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                    <Button
                        variant="outline"
                        size={compact ? "sm" : "icon"}
                        onClick={() => {
                            videoElement.currentTime = startTime;
                        }}
                        className={cn(compact && "h-6 w-6 p-0")}
                    >
                        <SkipBack className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
                    </Button>
                    
                    <Button
                        variant="outline"
                        size={compact ? "sm" : "icon"}
                        onClick={handlePlayPause}
                        className={cn(compact && "h-6 w-6 p-0")}
                    >
                        {isPlaying ? (
                            <Pause className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
                        ) : (
                            <Play className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
                        )}
                    </Button>
                    
                    <Button
                        variant="outline"
                        size={compact ? "sm" : "icon"}
                        onClick={() => {
                            videoElement.currentTime = endTime;
                        }}
                        className={cn(compact && "h-6 w-6 p-0")}
                    >
                        <SkipForward className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
                    </Button>
                </div>
                
                <div className="text-center text-xs text-gray-500">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>
        </div>
    );
}; 