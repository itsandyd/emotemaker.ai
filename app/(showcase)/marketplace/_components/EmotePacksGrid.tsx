"use client"

import { EmoteForSale, Emote } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmotePackWithItems } from "@/actions/get-emote-packs";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface EmotePacksGridProps {
  emotePacks: EmotePackWithItems[];
  loading?: boolean;
}

export default function EmotePacksGrid({ emotePacks, loading = false }: EmotePacksGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-dark-lighter rounded-xl animate-pulse h-64"></div>
        ))}
      </div>
    );
  }

  if (!emotePacks.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No emote packs found</h3>
        <p className="text-muted mb-4">There are no emote packs available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {emotePacks.map((pack) => {
        // Get preview emote (first emote in the pack)
        const previewEmote = pack.emotePackItems[0]?.emoteForSale;
        
        return (
          <PackCard
            key={pack.id}
            pack={pack}
            previewEmote={previewEmote}
          />
        );
      })}
    </div>
  );
}

interface PackCardProps {
  pack: EmotePackWithItems;
  previewEmote?: EmoteForSale & { emote: Emote };
}

function PackCard({ pack, previewEmote }: PackCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link href={`/marketplace/packs/${pack.id}`}>
      <div
        className="bg-dark-lighter rounded-xl overflow-hidden transition transform hover:scale-105 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4 flex items-center justify-center bg-dark-light h-40 relative">
          {(previewEmote?.imageUrl || pack.imageUrl) ? (
            <Image
              src={pack.imageUrl || previewEmote?.imageUrl || "/placeholder-emote.png"}
              alt={pack.name}
              width={160}
              height={160}
              className="object-contain"
            />
          ) : (
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-sm">
                {pack.emotePackItems.length} emotes
              </Badge>
            </div>
          )}
          
          <span className="absolute top-2 right-2 bg-primary px-2 py-1 rounded text-xs font-medium text-white">
            Pack
          </span>
          
          {isHovered && pack.emotePackItems.length > 1 && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 text-white">
              <span className="font-medium mb-1">Pack Contents:</span>
              <div className="grid grid-cols-3 gap-1 w-full">
                {pack.emotePackItems.slice(0, 6).map((item, i) => (
                  <div key={item.emoteForSale.id} className="relative w-full aspect-square">
                    {item.emoteForSale.imageUrl && (
                      <Image
                        src={item.emoteForSale.imageUrl}
                        alt="Emote preview"
                        fill
                        className="object-contain rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
              {pack.emotePackItems.length > 6 && (
                <span className="text-xs mt-1">+{pack.emotePackItems.length - 6} more</span>
              )}
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="text-sm font-medium mb-1 truncate" title={pack.name}>
            {pack.name}
          </h3>
          <div className="flex justify-between items-center mb-3">
            <Badge variant="outline" className="text-xs px-2 py-1 bg-dark rounded-full">
              {pack.emotePackItems.length} emotes
            </Badge>
            <span className="font-medium">
              ${pack.price.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-primary hover:bg-primary-dark text-xs py-1.5 rounded text-center transition"
            >
              View Pack
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
} 