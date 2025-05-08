"use client"

import { EmoteForSale, Emote } from "@prisma/client";
import MarketplaceClient from "./marketplace-client";

interface MarketplaceProps {
  initialEmotesForSale: (EmoteForSale & { emote: Emote })[];
  userEmotes: (Emote & { emoteForSale: EmoteForSale | null })[];
  userId: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function Marketplace({ 
  initialEmotesForSale, 
  userEmotes, 
  userId, 
  currentPage, 
  totalPages, 
  totalCount 
}: MarketplaceProps) {
  return (
    <MarketplaceClient 
      initialEmotesForSale={initialEmotesForSale}
      userEmotes={userEmotes}
      userId={userId}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
    />
  );
}
