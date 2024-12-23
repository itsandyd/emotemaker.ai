"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { KonvaEditor, VideoObject } from "../types"
import { formatTime } from "../utils/format-time"

interface VideoControlsProps {
  editor: KonvaEditor;
}

export const VideoControls = ({ editor }: VideoControlsProps) => {
  const [activeVideo, setActiveVideo] = useState<VideoObject | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const node = editor.selectedNode;
    if (node && editor.isVideoObject(node)) {
      const video = node as VideoObject;
      setActiveVideo(video);
      setDuration(video.getDuration());
      if (!isDragging) {
        setCurrentTime(video.getCurrentTime());
      }
      setIsPlaying(!video.getVideoElement().paused);
    } else {
      setActiveVideo(null);
      setIsPlaying(false);
    }
  }, [editor.selectedNode, isDragging]);

  useEffect(() => {
    if (!activeVideo) return;

    const video = activeVideo.getVideoElement();
    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', () => setIsPlaying(false));
    video.addEventListener('play', () => setIsPlaying(true));

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', () => setIsPlaying(false));
      video.removeEventListener('play', () => setIsPlaying(true));
    };
  }, [activeVideo, isDragging]);

  const handlePlayPause = useCallback(() => {
    if (!activeVideo) return;

    if (isPlaying) {
      activeVideo.pause();
    } else {
      activeVideo.play();
    }
  }, [activeVideo, isPlaying]);

  const handleTimeUpdate = useCallback((value: number) => {
    if (!activeVideo) return;
    setCurrentTime(value);
    activeVideo.setCurrentTime(value);
  }, [activeVideo]);

  const handleSliderDragStart = useCallback(() => {
    setIsDragging(true);
    if (isPlaying && activeVideo) {
      activeVideo.pause();
    }
  }, [isPlaying, activeVideo]);

  const handleSliderDragEnd = useCallback(() => {
    setIsDragging(false);
    if (isPlaying && activeVideo) {
      activeVideo.play();
    }
  }, [isPlaying, activeVideo]);

  if (!activeVideo) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlayPause}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </Button>
      <div className="flex-1 flex items-center gap-4">
        <span className="text-white text-sm">
          {formatTime(currentTime)}
        </span>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={([value]) => handleTimeUpdate(value)}
          onValueCommit={handleSliderDragEnd}
          onPointerDown={handleSliderDragStart}
          className="flex-1"
        />
        <span className="text-white text-sm">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};