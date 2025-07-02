'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmoteForSale, EmotePack } from "@prisma/client";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

interface EmotePackPreviewProps {
  pack: EmotePack;
  emotes: EmoteForSale[];
}

const EmotePackPreview = ({ pack, emotes }: EmotePackPreviewProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packId: pack.id }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to process purchase');
      }
      
      const data = await res.json();
      
      // Store purchase info in sessionStorage to retrieve after payment
      sessionStorage.setItem('currentPurchase', JSON.stringify({
        id: data.purchaseId,
        clientSecret: data.clientSecret,
        type: 'pack',
        packId: pack.id
      }));
      
      // Navigate to checkout
      router.push('/checkout');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Original item price calculation - handle null prices
  const originalItemsPrice = emotes.reduce((sum, emote) => sum + (emote.price || 0), 0);
  
  // Calculate discount percentage if it's cheaper than buying individually
  const totalPackPrice = pack.price || 0;
  const discountPercentage = originalItemsPrice > 0 
    ? Math.round(((originalItemsPrice - totalPackPrice) / originalItemsPrice) * 100) 
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="bg-dark-lighter rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            {emotes.slice(0, 5).map((emote, idx) => (
              <div 
                key={emote.id} 
                className="bg-dark-light rounded-lg flex items-center justify-center p-2 relative aspect-square overflow-hidden"
              >
                {emote.imageUrl && (
                  <Image
                    src={emote.watermarkedUrl || emote.imageUrl}
                    alt={emote.prompt || "Emote preview"}
                    fill
                    className="object-cover rounded-lg"
                  />
                )}
              </div>
            ))}
            {emotes.length > 5 ? (
              <div className="bg-primary rounded-lg flex items-center justify-center text-center p-4">
                <span className="text-sm font-medium">{emotes.length} Emotes<br/>Bundle</span>
              </div>
            ) : (
              <div className="bg-primary rounded-lg flex items-center justify-center text-center p-4">
                <span className="text-sm font-medium">{emotes.length} Emotes<br/>Bundle</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-dark-lighter rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Pack Contents</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {emotes.map(emote => (
              <div key={emote.id} className="flex items-center p-3 bg-dark-light rounded-lg relative">
                <div className="w-10 h-10 mr-3 relative rounded-lg overflow-hidden">
                  {emote.imageUrl && (
                    <Image
                      src={emote.watermarkedUrl || emote.imageUrl}
                      alt={emote.prompt || "Emote"}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{emote.prompt?.substring(0, 20) || "Untitled"}</h4>
                  <p className="text-xs text-muted">{emote.style || "Custom"} style</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold mb-2">{pack.name}</h1>
        
        {/* Tags would need to come from a different source */}
        {/* <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, idx) => (
            <Badge 
              key={idx}
              variant="outline" 
              className="text-xs px-2 py-1 bg-dark rounded-full text-muted"
            >
              {tag}
            </Badge>
          ))}
        </div> */}

        <div className="mb-6">
          <p className="text-muted mb-4">{pack.description || "No description available"}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm text-muted mb-1">Models Used</h3>
              <p>{emotes[0]?.model || "Various models"}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted mb-1">Creator</h3>
              <p>TwitchEmotes.ai Creator</p>
            </div>
            <div>
              <h3 className="text-sm text-muted mb-1">Type</h3>
              <p>Static PNG ({emotes.length} emotes)</p>
            </div>
            <div>
              <h3 className="text-sm text-muted mb-1">Date Created</h3>
              <p>{new Date(pack.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm text-muted mb-2">All Emotes Include These Sizes</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              <div className="text-center">
                <div className="aspect-square bg-dark-light rounded-lg flex items-center justify-center mb-1">
                  <span className="text-xs">Full</span>
                </div>
                <span className="text-xs text-muted">Original</span>
              </div>
              <div className="text-center">
                <div className="aspect-square bg-dark-light rounded-lg flex items-center justify-center mb-1">
                  <span className="text-xs">128px</span>
                </div>
                <span className="text-xs text-muted">Discord</span>
              </div>
              <div className="text-center">
                <div className="aspect-square bg-dark-light rounded-lg flex items-center justify-center mb-1">
                  <span className="text-xs">112px</span>
                </div>
                <span className="text-xs text-muted">Twitch L</span>
              </div>
              <div className="text-center">
                <div className="aspect-square bg-dark-light rounded-lg flex items-center justify-center mb-1">
                  <span className="text-xs">56px</span>
                </div>
                <span className="text-xs text-muted">Twitch M</span>
              </div>
              <div className="text-center">
                <div className="aspect-square bg-dark-light rounded-lg flex items-center justify-center mb-1">
                  <span className="text-xs">28px</span>
                </div>
                <span className="text-xs text-muted">Twitch S</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 py-4 border-y border-dark-light">
            <div>
              <div className="flex items-center mb-1">
                <span className="text-lg font-semibold text-secondary">${pack.price.toFixed(2)}</span>
                {discountPercentage > 0 && (
                  <>
                    <span className="text-sm text-muted line-through ml-2">${originalItemsPrice.toFixed(2)}</span>
                    <span className="text-xs bg-secondary text-dark px-2 py-0.5 rounded ml-2">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted">Individual emotes: ${emotes[0]?.price?.toFixed(2) || "0.00"} each</p>
            </div>
            <Button
              onClick={handlePurchase}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-dark transition px-8 py-3 rounded-lg font-medium"
            >
              {isLoading ? "Processing..." : "Purchase Pack"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotePackPreview;
