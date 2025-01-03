"use client"

import { useCallback, useEffect, useState, useRef } from "react"
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const lastPlayingVideoRef = useRef<VideoObject | null>(null);

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
      lastPlayingVideoRef.current = video;
      
      // Add loading state tracking
      const videoElement = video.getVideoElement();
      setIsLoading(!videoElement.readyState || videoElement.readyState < 3);
      
      const handleProgress = () => {
        if (videoElement.buffered.length > 0) {
          const progress = (videoElement.buffered.end(0) / videoElement.duration) * 100;
          setLoadingProgress(Math.round(progress));
        }
      };
      
      const handleCanPlay = () => {
        setIsLoading(false);
        setLoadingProgress(100);
      };
      
      videoElement.addEventListener('progress', handleProgress);
      videoElement.addEventListener('canplay', handleCanPlay);
      
      return () => {
        videoElement.removeEventListener('progress', handleProgress);
        videoElement.removeEventListener('canplay', handleCanPlay);
      };
    } else if (lastPlayingVideoRef.current && !lastPlayingVideoRef.current.getVideoElement().paused) {
      // Keep showing controls if the last video is still playing
      setActiveVideo(lastPlayingVideoRef.current);
      setDuration(lastPlayingVideoRef.current.getDuration());
      if (!isDragging) {
        setCurrentTime(lastPlayingVideoRef.current.getCurrentTime());
      }
      setIsPlaying(true);
    } else {
      setActiveVideo(null);
      setIsPlaying(false);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  }, [editor, editor.selectedNode, isDragging]);

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

  if (!activeVideo && !lastPlayingVideoRef.current?.getVideoElement()?.played) return null;

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
        <span className="text-white text-sm">{formatTime(currentTime)}</span>
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
        <span className="text-white text-sm">{formatTime(duration)}</span>
      </div>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          disabled={isLoading}
        >
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
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
        </Button>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span className="sr-only">Loading {loadingProgress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};