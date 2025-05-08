import { db } from "@/lib/db";
import { Prisma, EmoteStatus } from "@prisma/client";

export const getEmotePacks = async ({
  userId,
  page = 1,
  itemsPerPage = 9
}: {
  userId: string;
  page?: number;
  itemsPerPage?: number;
}) => {
  try {
    const skip = (page - 1) * itemsPerPage;

    // Use transaction to fetch count and packs in a single db operation
    const emotePacksWithCount = await db.$transaction([
      db.emotePack.count({
        where: { userId },
      }),
      db.emotePack.findMany({
        where: { userId },
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
      emotePacks,
      totalPages,
      currentPage: page,
      totalCount,
    };
  } catch (error) {
    console.error("[GET_EMOTE_PACKS_ERROR]", error);
    throw new Error("Failed to fetch emote packs");
  }
} 