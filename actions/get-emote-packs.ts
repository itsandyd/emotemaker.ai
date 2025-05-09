import { db } from "@/lib/db";
import { Prisma, EmoteStatus, EmotePack, EmoteForSale, Emote } from "@prisma/client";

export interface EmotePackWithItems extends EmotePack {
  emotePackItems: {
    emoteForSale: EmoteForSale & {
      emote: Emote
    }
  }[];
}

export interface GetEmotePacksResult {
  emotePacks: EmotePackWithItems[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export const getEmotePacks = async ({
  userId,
  page = 1,
  itemsPerPage = 9,
  status = EmoteStatus.PUBLISHED
}: {
  userId: string;
  page?: number;
  itemsPerPage?: number;
  status?: EmoteStatus;
}): Promise<GetEmotePacksResult> => {
  try {
    const skip = (page - 1) * itemsPerPage;

    // Build where clause
    const where: Prisma.EmotePackWhereInput = {
      status,
    };
    
    // If userId is provided, filter by it (otherwise return all packs)
    if (userId) {
      where.userId = userId;
    }

    // Use transaction to fetch count and packs in a single db operation
    const emotePacksWithCount = await db.$transaction([
      db.emotePack.count({
        where,
      }),
      db.emotePack.findMany({
        where,
        include: {
          emotePackItems: {
            include: {
              emoteForSale: {
                include: {
                  emote: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: itemsPerPage,
      }),
    ]);

    const [totalCount, emotePacks] = emotePacksWithCount;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return {
      emotePacks: emotePacks as EmotePackWithItems[],
      totalPages,
      currentPage: page,
      totalCount,
    };
  } catch (error) {
    console.error("[GET_EMOTE_PACKS_ERROR]", error);
    throw new Error("Failed to fetch emote packs");
  }
} 