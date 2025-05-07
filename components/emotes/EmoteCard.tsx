"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { Download, Lock, Loader2, FileVideo, PlayCircle, ImageIcon } from "lucide-react";
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

  // Reset error state when imageUrl changes
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

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

  const downloadImage = async (url: string, size: string) => {
    try {
      setIsDownloading(true);
      
      // Create a sanitized filename from the prompt or use the ID
      const filename = prompt ? 
        prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30) : 
        id;
      
      // Use our proxy API to handle the download
      const proxyUrl = `/api/download-emote?url=${encodeURIComponent(url)}&size=${size}&filename=${encodeURIComponent(filename)}`;
      
      // Create a temporary anchor and trigger download
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = `emote_${filename}_${size}.${isVideo ? 'mp4' : (isGif ? 'gif' : 'png')}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
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
        <div className="relative w-full aspect-square max-h-[300px] mx-auto">
          <video
            id="emote-dialog-video"
            src={imageUrl}
            className="w-full h-full object-contain rounded-lg cursor-pointer"
            loop
            muted
            playsInline
            autoPlay
            onClick={(e) => toggleVideoPlay(e.currentTarget)}
          />
          <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600">
            <FileVideo className="h-3 w-3 mr-1" />
            Video
          </Badge>
        </div>
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
                <Button disabled={isDownloading} className="w-full">
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
                    downloadImage(imageUrl, 'full');
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
                <DropdownMenuItem onClick={() => downloadImage(imageUrl, 'discord')}>
                  <Download className="h-4 w-4 mr-2" />
                  Discord (128x128)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadImage(imageUrl, 'twitch-small')}>
                  <Download className="h-4 w-4 mr-2" />
                  Twitch Small (28x28)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadImage(imageUrl, 'twitch-medium')}>
                  <Download className="h-4 w-4 mr-2" />
                  Twitch Medium (56x56)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadImage(imageUrl, 'twitch-large')}>
                  <Download className="h-4 w-4 mr-2" />
                  Twitch Large (112x112)
                </DropdownMenuItem>
                {isGif && (
                  <DropdownMenuItem onClick={() => downloadImage(imageUrl, 'gif')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download as GIF
                  </DropdownMenuItem>
                )}
                {isVideo && (
                  <DropdownMenuItem onClick={() => downloadImage(imageUrl, 'video')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Video
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