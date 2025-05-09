"use client"

import { EmoteForSale, Emote } from "@prisma/client";
import MarketplaceClient from "./marketplace-client";
import { EmotePackWithItems } from "@/actions/get-emote-packs";

interface MarketplaceProps {
  initialEmotesForSale: (EmoteForSale & { emote: Emote })[];
  userEmotes: (Emote & { emoteForSale: EmoteForSale | null })[];
  emotePacks: EmotePackWithItems[];
  userId: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  packsCurrentPage?: number;
  packsTotalPages?: number;
  packsTotalCount?: number;
}

export default function Marketplace({ 
  initialEmotesForSale, 
  userEmotes, 
  emotePacks = [],
  userId, 
  currentPage, 
  totalPages, 
  totalCount,
  packsCurrentPage = 1,
  packsTotalPages = 1,
  packsTotalCount = 0
}: MarketplaceProps) {
  return (
    <MarketplaceClient 
      initialEmotesForSale={initialEmotesForSale}
      userEmotes={userEmotes}
      emotePacks={emotePacks}
      userId={userId}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      packsCurrentPage={packsCurrentPage}
      packsTotalPages={packsTotalPages}
      packsTotalCount={packsTotalCount}
    />
  );
}
