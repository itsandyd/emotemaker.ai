import { db } from "../lib/db";
import { EmoteForSale, Emote } from "@prisma/client";
import { cache } from 'react'

interface GetEmoteForSaleProps {
  emoteId: string;
}

export type EmoteForSaleWithDetails = EmoteForSale & {
  emote: Emote;
}

export const getEmoteForSaleById = cache(async ({
  emoteId,
}: GetEmoteForSaleProps) => {
  try {
    const emoteForSale = await db.emoteForSale.findUnique({
      where: {
        id: emoteId,
      },
      include: {
        emote: true,
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!emoteForSale) {
      return null;
    }

    return emoteForSale;
  } catch (error) {
    console.log("[GET_EMOTE_FOR_SALE_BY_ID] Error:", error);
    return null;
  }
});

export const revalidate = 300; 