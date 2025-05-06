import React, { useEffect, useState, useRef } from 'react';
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface VideoTimelineProps {
  videoElement: HTMLVideoElement;
  startTime: number;
  endTime: number;
  duration: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onTimeUpdate: (time: number) => void;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  videoElement,
  startTime,
  endTime,
  duration,
  onStartTimeChange,
  onEndTimeChange,
  onTimeUpdate,
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'selection' | null>(null);
  const [internalStartTime, setInternalStartTime] = useState(startTime);
  const [internalEndTime, setInternalEndTime] = useState(endTime);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const selectionLengthRef = useRef(0);

  const MIN_GAP = 0.1; // Minimum 0.1 second gap between start and end

  // Sync props to internal state
  useEffect(() => {
    setInternalStartTime(startTime);
  }, [startTime]);

  useEffect(() => {
    setInternalEndTime(endTime);
  }, [endTime]);

  useEffect(() => {
    const generateThumbnails = async () => {
      if (!videoElement || !canvasRef.current || isGeneratingThumbnails) return;
      setIsGeneratingThumbnails(true);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const thumbnailCount = 10;
      const newThumbnails: string[] = [];

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      for (let i = 0; i < thumbnailCount; i++) {
        const time = (duration / thumbnailCount) * i;
        videoElement.currentTime = time;

        await new Promise<void>((resolve) => {
          videoElement.onseeked = () => resolve();
        });

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        newThumbnails.push(canvas.toDataURL('image/jpeg', 0.5));
      }

      videoElement.currentTime = internalStartTime;
      setThumbnails(newThumbnails);
      setIsGeneratingThumbnails(false);
    };

    generateThumbnails();
  }, [videoElement, duration]);

  // Store the selection length when starting to drag the selection
  useEffect(() => {
    if (isDragging === 'selection') {
      selectionLengthRef.current = internalEndTime - internalStartTime;
    }
  }, [isDragging, internalStartTime, internalEndTime]);

  const handleMouseDown = (handle: 'start' | 'end' | 'selection') => (e: React.MouseEvent) => {
    setIsDragging(handle);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;

    if (isDragging === 'selection') {
      // When dragging the selection, move both start and end times together
      const selectionLength = selectionLengthRef.current;
      const newStartTime = Math.max(0, Math.min(duration - selectionLength, newTime));
      const newEndTime = newStartTime + selectionLength;
      
      if (newEndTime <= duration) {
        setInternalStartTime(newStartTime);
        setInternalEndTime(newEndTime);
        onStartTimeChange(newStartTime);
        onEndTimeChange(newEndTime);
      }
    } else if (isDragging === 'start') {
      // Ensure start time doesn't go beyond (endTime - MIN_GAP)
      const maxStartTime = internalEndTime - MIN_GAP;
      const clampedTime = Math.max(0, Math.min(maxStartTime, newTime));
      setInternalStartTime(clampedTime);
      onStartTimeChange(clampedTime);
    } else {
      // Ensure end time doesn't go below (startTime + MIN_GAP)
      const minEndTime = internalStartTime + MIN_GAP;
      const clampedTime = Math.max(minEndTime, Math.min(duration, newTime));
      setInternalEndTime(clampedTime);
      onEndTimeChange(clampedTime);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove as any);
    }
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [isDragging, internalStartTime, internalEndTime]);

  // Add visual feedback for when handles can't move further
  const isStartAtLimit = internalStartTime >= internalEndTime - MIN_GAP;
  const isEndAtLimit = internalEndTime <= internalStartTime + MIN_GAP;

  return (
    <div className="w-full h-full flex items-center gap-2">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Thumbnails container */}
      <div 
        ref={timelineRef}
        className="relative h-10 flex-1 rounded-md overflow-hidden bg-black/5"
      >
        <div className="absolute inset-0 flex">
          {thumbnails.map((thumbnail, index) => (
            <div
              key={index}
              className="flex-1 h-full"
              style={{
                backgroundImage: `url(${thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
        </div>
        
        {/* Selection overlay */}
        <div
          className={cn(
            "absolute inset-y-0 bg-blue-500/20 cursor-move",
            isDragging === 'selection' && "bg-blue-500/30"
          )}
          style={{
            left: `${(internalStartTime / duration) * 100}%`,
            right: `${100 - (internalEndTime / duration) * 100}%`,
          }}
          onMouseDown={handleMouseDown('selection')}
        />

        {/* Start handle */}
        <div
          className={cn(
            "absolute top-0 bottom-0 w-1 cursor-ew-resize group",
            isDragging === 'start' ? "bg-blue-600" : "bg-blue-500",
            isStartAtLimit && "bg-red-500"
          )}
          style={{ left: `${(internalStartTime / duration) * 100}%` }}
          onMouseDown={handleMouseDown('start')}
        >
          <div className="absolute inset-y-0 -left-2 w-4 flex items-center justify-center">
            <GripVertical className={cn(
              "h-4 w-4 text-white drop-shadow",
              isStartAtLimit && "text-red-100"
            )} />
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap font-medium">
            Start: {internalStartTime.toFixed(1)}s
          </div>
        </div>

        {/* End handle */}
        <div
          className={cn(
            "absolute top-0 bottom-0 w-1 cursor-ew-resize group",
            isDragging === 'end' ? "bg-blue-600" : "bg-blue-500",
            isEndAtLimit && "bg-red-500"
          )}
          style={{ left: `${(internalEndTime / duration) * 100}%` }}
          onMouseDown={handleMouseDown('end')}
        >
          <div className="absolute inset-y-0 -left-2 w-4 flex items-center justify-center">
            <GripVertical className={cn(
              "h-4 w-4 text-white drop-shadow",
              isEndAtLimit && "text-red-100"
            )} />
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap font-medium">
            End: {internalEndTime.toFixed(1)}s
          </div>
        </div>

        {/* Duration indicator */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap font-medium text-gray-500">
          Duration: {(internalEndTime - internalStartTime).toFixed(1)}s
        </div>
      </div>
    </div>
  );
}; 