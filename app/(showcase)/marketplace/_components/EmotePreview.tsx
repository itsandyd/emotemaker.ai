'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmoteForSale, Emote, User } from "@prisma/client";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Download, Star, Share2, Heart } from "lucide-react";

interface EmotePreviewProps {
  emote: EmoteForSale & {
    emote: Emote;
    user?: {
      id: string;
      name: string | null;
    } | null;
  };
}

const EmotePreview = ({ emote }: EmotePreviewProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/stripe/purchase-emote?emoteId=${emote.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        throw new Error('Failed to process purchase');
      }
      
      const data = await res.json();
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: "Failed to process purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left side - Emote display */}
      <div>
        <div className="bg-white border rounded-xl p-8 mb-6">
          <div className="aspect-square relative max-w-sm mx-auto">
            {emote.imageUrl && (
              <Image
                src={emote.watermarkedUrl || emote.imageUrl}
                alt={emote.prompt || "Emote preview"}
                fill
                className="object-contain rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Size previews */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Included Sizes</h3>
          <div className="grid grid-cols-5 gap-3">
            <div className="text-center">
              <div className="aspect-square bg-gray-50 border rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
                {emote.imageUrl && (
                  <Image
                    src={emote.watermarkedUrl || emote.imageUrl}
                    alt="Original size"
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <span className="text-xs text-gray-600">Original</span>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-gray-50 border rounded-lg flex items-center justify-center mb-2 relative overflow-hidden w-16 h-16 mx-auto">
                {emote.imageUrl && (
                  <Image
                    src={emote.watermarkedUrl || emote.imageUrl}
                    alt="128px Discord size"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                )}
              </div>
              <span className="text-xs text-gray-600">128px<br/>Discord</span>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-gray-50 border rounded-lg flex items-center justify-center mb-2 relative overflow-hidden w-16 h-16 mx-auto">
                {emote.imageUrl && (
                  <Image
                    src={emote.watermarkedUrl || emote.imageUrl}
                    alt="112px Twitch size"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                )}
              </div>
              <span className="text-xs text-gray-600">112px<br/>Twitch L</span>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-gray-50 border rounded-lg flex items-center justify-center mb-2 relative overflow-hidden w-16 h-16 mx-auto">
                {emote.imageUrl && (
                  <Image
                    src={emote.watermarkedUrl || emote.imageUrl}
                    alt="56px Twitch size"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                )}
              </div>
              <span className="text-xs text-gray-600">56px<br/>Twitch M</span>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-gray-50 border rounded-lg flex items-center justify-center mb-2 relative overflow-hidden w-16 h-16 mx-auto">
                {emote.imageUrl && (
                  <Image
                    src={emote.watermarkedUrl || emote.imageUrl}
                    alt="28px Twitch size"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                )}
              </div>
              <span className="text-xs text-gray-600">28px<br/>Twitch S</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Emote details and purchase */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{emote.prompt || "Untitled Emote"}</h1>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {emote.style && (
            <Badge variant="secondary" className="text-xs px-3 py-1">
              {emote.style}
            </Badge>
          )}
          {emote.model && (
            <Badge variant="secondary" className="text-xs px-3 py-1">
              {emote.model}
            </Badge>
          )}
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{emote.style || "Custom"}</h3>
              <p className="text-gray-900">{emote.user?.name || "itsandyd"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{emote.model || "gpt-image-1"}</h3>
              <p className="text-gray-900">{new Date(emote.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-gray-100">PNG</Badge>
              <Badge variant="outline" className="bg-gray-100">Transparent Background</Badge>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">${emote.price || 0}</div>
          </div>

          <div className="space-y-3 mb-6">
            <Button 
              onClick={handlePurchase} 
              disabled={isLoading}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white"
              size="lg"
            >
              {isLoading ? "Processing..." : `Purchase for $${emote.price || 0}`}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 border-gray-300">
                <Heart className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="flex-1 border-gray-300">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>✓ Instant download after purchase</p>
            <p>✓ Multiple sizes included</p>
            <p>✓ Commercial use allowed</p>
            <p>✓ High-quality PNG format</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotePreview; 