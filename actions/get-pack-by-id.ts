import { db } from "../lib/db";
import { EmotePack, EmoteForSale } from "@prisma/client";
import { cache } from 'react'

interface GetPackProps {
  packId: string;
};

export const getPackById = cache(async ({
  packId,
}: GetPackProps) => {
  try {
    const pack = await db.emotePack.findUnique({
      where: {
        id: packId,
      },
      include: {
        emotePackItems: {
          include: {
            emoteForSale: true
          }
        }
      }
    });

    if (!pack) {
      return null;
    }

    // Transform the data structure to make it easier to work with in the frontend
    const emotes = pack.emotePackItems.map(item => item.emoteForSale);

    return {
      pack,
      emotes
    };
  } catch (error) {
    console.log("[GET_PACK_BY_ID] Error:", error);
    return null;
  }
});

// Set the revalidation period (e.g., 300 seconds)
export const revalidate = 300; 