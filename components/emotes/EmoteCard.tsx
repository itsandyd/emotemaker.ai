"use client"

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Download, Lock, Loader2, FileVideo, PlayCircle, ImageIcon, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { RangeSlider } from "@/components/ui/range-slider";
import toast from "react-hot-toast";

interface EmoteCardProps {
  id: string;
  imageUrl: string;
  prompt: string | null;
  isVideo?: boolean;
  isGif?: boolean;
  isPremiumUser?: boolean;
}

export const EmoteCard = ({ 
  id, 
  imageUrl, 
  prompt, 
  isVideo = false,
  isGif = false,
  isPremiumUser = false
}: EmoteCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);
  const [showTrimControls, setShowTrimControls] = useState(false);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 10]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  // Reset error state when imageUrl changes
  useEffect(() => {
    setImageError(false);
    setTrimmedVideoUrl(null);
    setShowTrimControls(false);
  }, [imageUrl]);

  // Set video duration when metadata is loaded
  const handleVideoMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setTrimRange([0, videoRef.current.duration]);
    }
  };

  const toggleVideoPlay = (videoEl: HTMLVideoElement) => {
    if (videoEl) {
      if (videoEl.paused) {
        videoEl.play().catch(e => console.error('Error playing video:', e));
        setIsVideoPlaying(true);
      } else {
        videoEl.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const trimVideo = async () => {
    if (!isVideo) return;
    
    try {
      setIsTrimming(true);
      
      const response = await fetch('/api/video/trim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: imageUrl,
          startTime: trimRange[0],
          endTime: trimRange[1],
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error trimming video: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.videoUrl) {
        setTrimmedVideoUrl(data.videoUrl);
        toast.success('Video trimmed successfully');
      } else {
        throw new Error(data.message || 'Failed to trim video');
      }
    } catch (error) {
      console.error('Error trimming video:', error);
      toast.error('Failed to trim video');
    } finally {
      setIsTrimming(false);
    }
  };

  const downloadContent = async (url: string, size: string) => {
    try {
      setIsDownloading(true);
      
      // Create a sanitized filename from the prompt or use the ID
      const filename = prompt ? 
        prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30) : 
        id;
      
      if (isVideo) {
        // Use the video download API for videos
        const videoUrl = trimmedVideoUrl || url;
        const startTime = trimmedVideoUrl ? 0 : trimRange[0];
        const endTime = trimmedVideoUrl ? null : (trimRange[1] < videoDuration ? trimRange[1] : null);

        // Use our video download API
        const proxyUrl = `/api/video/download?url=${encodeURIComponent(videoUrl)}&size=${size}&filename=${encodeURIComponent(filename)}${startTime > 0 ? `&start=${startTime}` : ''}${endTime ? `&end=${endTime}` : ''}`;
        
        const a = document.createElement('a');
        a.href = proxyUrl;
        a.download = `emote_${filename}_${size}.mp4`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Use existing download method for images and GIFs
        const proxyUrl = `/api/download-emote?url=${encodeURIComponent(url)}&size=${size}&filename=${encodeURIComponent(filename)}`;
        
        const a = document.createElement('a');
        a.href = proxyUrl;
        a.download = `emote_${filename}_${size}.${isGif ? 'gif' : 'png'}`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      toast.success(`Downloaded ${size} size`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download emote');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderEmotePreview = () => {
    if (isVideo) {
      return (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <PlayCircle className="w-12 h-12 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={imageUrl}
            muted
            loop
            playsInline
          />
          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
            <FileVideo className="h-3 w-3 mr-1" />
            Video
          </Badge>
        </div>
      );
    }

    if (imageError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-100 text-slate-500">
          <ImageIcon className="h-10 w-10 mb-2" />
          <span className="text-xs text-center">Image unavailable</span>
        </div>
      );
    }

    return (
      <Image 
        fill 
        className="object-cover" 
        src={imageUrl || "/placeholder.svg"} 
        alt={prompt?.substring(0, 20) || "Emote"}
        onError={() => setImageError(true)}
        unoptimized
      />
    );
  };

  const renderDialogContent = () => {
    if (isVideo) {
      return (
        <>
          <div className="relative w-full aspect-square max-h-[300px] mx-auto">
            <video
              id="emote-dialog-video"
              ref={videoRef}
              src={trimmedVideoUrl || imageUrl}
              className="w-full h-full object-contain rounded-lg cursor-pointer"
              loop
              muted
              playsInline
              autoPlay
              onLoadedMetadata={handleVideoMetadata}
              onClick={(e) => toggleVideoPlay(e.currentTarget)}
            />
            <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600">
              <FileVideo className="h-3 w-3 mr-1" />
              Video
            </Badge>
          </div>
          
          {showTrimControls && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span>Start: {trimRange[0].toFixed(1)}s</span>
                <span>End: {trimRange[1].toFixed(1)}s</span>
              </div>
              <RangeSlider 
                value={trimRange}
                min={0}
                max={videoDuration}
                step={0.1}
                onValueChange={(value) => setTrimRange(value as [number, number])}
                className="mt-2"
              />
              <Button 
                onClick={trimVideo}
                disabled={isTrimming}
                variant="outline"
                className="w-full"
              >
                {isTrimming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Trimming...
                  </>
                ) : (
                  <>
                    <Scissors className="h-4 w-4 mr-2" />
                    Trim Video
                  </>
                )}
              </Button>
            </div>
          )}
          
          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTrimControls(!showTrimControls)}
            >
              {showTrimControls ? "Hide Trim Controls" : "Show Trim Controls"}
            </Button>
          </div>
        </>
      );
    }

    if (imageError) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] bg-slate-100 text-slate-500 rounded-lg">
          <ImageIcon className="h-16 w-16 mb-3" />
          <span className="text-sm">Image unavailable</span>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-square max-h-[300px] mx-auto">
        <Image 
          fill 
          className="object-contain" 
          src={imageUrl || "/placeholder.svg"} 
          alt={prompt?.substring(0, 20) || "Emote"}
          onError={() => setImageError(true)}
          unoptimized
        />
        {isGif && (
          <Badge className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600">
            GIF
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="group hover:shadow-lg transition overflow-hidden border rounded-lg p-3 h-full">
      <div 
        className="relative w-full aspect-square rounded-md cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        {renderEmotePreview()}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      <div className="flex flex-col pt-2">
        <div className="text-lg md:text-base font-medium truncate">
          {prompt || "Untitled Emote"}
        </div>
        {(isVideo || isGif) && (
          <div className="flex items-center mt-1">
            {isVideo && <FileVideo className="h-3.5 w-3.5 text-gray-500 mr-1" />}
            <span className="text-xs text-gray-500">
              {isVideo ? "Video" : isGif ? "GIF" : ""}
            </span>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Emote</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            {renderDialogContent()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isDownloading || isTrimming} className="w-full">
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    "Select Size"
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="center">
                <DropdownMenuItem
                  onClick={() => {
                    if (!isPremiumUser) {
                      toast.error('Pro or Team plan required for full-resolution downloads');
                      return;
                    }
                    downloadContent(imageUrl, 'full');
                  }}
                  className={!isPremiumUser ? "opacity-50" : ""}
                >
                  {isPremiumUser ? (
                    <Download className="h-4 w-4 mr-2" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Full Resolution {!isPremiumUser && "(Pro or Team plan)"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadContent(imageUrl, 'discord')}>
                  <Download className="h-4 w-4 mr-2" />
                  Discord (128x128)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadContent(imageUrl, 'twitch-small')}>
                  <Download className="h-4 w-4 mr-2" />
                  Twitch Small (28x28)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadContent(imageUrl, 'twitch-medium')}>
                  <Download className="h-4 w-4 mr-2" />
                  Twitch Medium (56x56)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadContent(imageUrl, 'twitch-large')}>
                  <Download className="h-4 w-4 mr-2" />
                  Twitch Large (112x112)
                </DropdownMenuItem>
                {isGif && (
                  <DropdownMenuItem onClick={() => downloadContent(imageUrl, 'gif')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download as GIF
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};