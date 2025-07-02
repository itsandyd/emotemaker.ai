"use client";

import { Button } from "@/components/ui/button";
import { EmotePack, EmoteForSale } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";

interface EmotePackPreviewProps {
  pack: EmotePack;
  emotes: EmoteForSale[];
}

export const EmotePackPreview = ({ pack, emotes }: EmotePackPreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      // Implement purchase functionality
      console.log("Purchase initiated for pack:", pack.id);
      // You would typically redirect to a checkout page or call a purchase API
    } catch (error) {
      console.error("Error purchasing pack:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">{pack.name}</h1>
          <p className="text-muted-foreground mb-6">{pack.description}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {emotes.map((emote) => (
              <div key={emote.id} className="aspect-square relative rounded-md overflow-hidden border bg-background">
                <Image
                  src={emote.watermarkedUrl || emote.imageUrl}
                  alt={emote.prompt}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="md:col-span-1">
        <div className="bg-card rounded-lg p-6 shadow-sm sticky top-24">
          <div className="text-3xl font-bold mb-4">${pack.price.toFixed(2)}</div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span>Emotes included:</span>
              <span className="font-semibold">{emotes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Format:</span>
              <span className="font-semibold">PNG</span>
            </div>
          </div>
          
          <Button 
            className="w-full mb-2" 
            size="lg"
            onClick={handlePurchase}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Purchase Pack"}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            By purchasing, you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}; 