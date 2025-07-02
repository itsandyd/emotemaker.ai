"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { KonvaEditor, VideoObject } from "../types"
import { formatTime } from "../utils/format-time"
import { VideoTimeline } from "./video-timeline"

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
      const video = node;
      const videoElement = video.attrs.videoElement;
      
      // Use cached duration if video element not ready
      const duration = videoElement.duration || video.attrs.duration || 0;
      
      setActiveVideo(video);
      setDuration(duration);
      
      if (!isDragging) {
        const currentTime = Math.max(video.attrs.startTime, 
                                  Math.min(videoElement.currentTime, 
                                  video.attrs.endTime));
        setCurrentTime(currentTime);
      }
      
      setIsPlaying(video.attrs.isPlaying);
      lastPlayingVideoRef.current = video;
      
      // Add loading state tracking
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
    } else if (lastPlayingVideoRef.current) {
      const lastVideo = lastPlayingVideoRef.current.attrs.videoElement;
      if (!lastVideo.paused) {
        // Keep showing controls if the last video is still playing
        setActiveVideo(lastPlayingVideoRef.current);
        setDuration(lastVideo.duration);
        if (!isDragging) {
          setCurrentTime(lastVideo.currentTime);
        }
        setIsPlaying(true);
      }
    } else {
      setActiveVideo(null);
      setIsPlaying(false);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  }, [editor.selectedNode, editor, isDragging]);

  useEffect(() => {
    if (!activeVideo) return;

    const videoElement = activeVideo.attrs.videoElement;
    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(videoElement.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('pause', () => setIsPlaying(false));
    videoElement.addEventListener('play', () => setIsPlaying(true));

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('pause', () => setIsPlaying(false));
      videoElement.removeEventListener('play', () => setIsPlaying(true));
    };
  }, [activeVideo, isDragging]);

  const handlePlayPause = useCallback(() => {
    if (!activeVideo) return;
    const videoElement = activeVideo.attrs.videoElement;

    if (isPlaying) {
      videoElement.pause();
      activeVideo.attrs.isPlaying = false;
    } else {
      videoElement.currentTime = activeVideo.attrs.startTime || 0;
      videoElement.play().catch(console.error);
      activeVideo.attrs.isPlaying = true;
    }
  }, [activeVideo, isPlaying]);

  const handleTimeUpdate = useCallback((value: number) => {
    if (!activeVideo) return;
    const videoElement = activeVideo.attrs.videoElement;
    const startTime = activeVideo.attrs.startTime || 0;
    const endTime = activeVideo.attrs.endTime || videoElement.duration;
    const newTime = Math.max(startTime, Math.min(value, endTime));
    setCurrentTime(newTime);
    videoElement.currentTime = newTime;
  }, [activeVideo]);

  const handleSliderDragStart = useCallback(() => {
    setIsDragging(true);
    if (isPlaying && activeVideo) {
      const videoElement = activeVideo.attrs.videoElement;
      videoElement.pause();
      activeVideo.attrs.isPlaying = false;
    }
  }, [isPlaying, activeVideo]);

  const handleSliderDragEnd = useCallback(() => {
    setIsDragging(false);
    if (isPlaying && activeVideo) {
      const videoElement = activeVideo.attrs.videoElement;
      videoElement.play().catch(console.error);
      activeVideo.attrs.isPlaying = true;
    }
  }, [isPlaying, activeVideo]);

  if (!activeVideo && !lastPlayingVideoRef.current?.attrs.videoElement?.played) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex flex-col gap-4">
      {activeVideo && (
        <VideoTimeline
          videoElement={activeVideo.attrs.videoElement}
          startTime={activeVideo.attrs.startTime || 0}
          endTime={activeVideo.attrs.endTime || activeVideo.attrs.videoElement.duration}
          duration={activeVideo.attrs.videoElement.duration}
          onStartTimeChange={(time) => editor.setVideoStartTime(time)}
          onEndTimeChange={(time) => editor.setVideoEndTime(time)}
          onTimeUpdate={handleTimeUpdate}
        />
      )}
      <div className="flex items-center gap-4">
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
    </div>
  );
};