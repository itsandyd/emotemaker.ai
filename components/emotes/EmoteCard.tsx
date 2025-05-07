"use client"

import Image from "next/image";
import { useState } from "react";
import { Download, Lock, Loader2 } from "lucide-react";
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
      a.download = `emote_${filename}_${size}.png`;
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

  return (
    <div className="group hover:shadow-lg transition overflow-hidden border rounded-lg p-3 h-full">
      <div 
        className="relative w-full aspect-square rounded-md cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <Image fill className="object-cover" src={imageUrl || ""} alt={prompt || ""} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      <div className="flex flex-col pt-2">
        <div className="text-lg md:text-base font-medium truncate">
          {prompt}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Emote</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <div className="relative w-full aspect-square max-h-[200px] mx-auto">
              <Image 
                fill 
                className="object-contain" 
                src={imageUrl || ""} 
                alt={prompt || ""} 
              />
            </div>
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