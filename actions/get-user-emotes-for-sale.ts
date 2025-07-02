"use server";

import { db } from "@/lib/db";
import { Prisma, EmoteStatus } from "@prisma/client";

export const getUserEmotesForSale = async ({
  userId,
  page = 1,
  itemsPerPage = 100
}: {
  userId: string;
  page?: number;
  itemsPerPage?: number;
}) => {
  try {
    const skip = (page - 1) * itemsPerPage;

    const whereClause: Prisma.EmoteForSaleWhereInput = {
      userId: userId,
      // We don't filter by status so we can see all user emotes regardless of status
    };

    const [emotesForSale, totalCount] = await Promise.all([
      db.emoteForSale.findMany({
        where: whereClause,
        skip,
        take: itemsPerPage,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          emote: true,
        },
      }),
      db.emoteForSale.count({
        where: whereClause,
      }),
    ]);

    console.log(`Found ${emotesForSale.length} emotes for user ${userId}`);
    return { emotesForSale, totalCount };
  } catch (error) {
    console.error("[GET_USER_EMOTES_FOR_SALE_ERROR]", error);
    throw new Error("Failed to fetch user's emotes for sale");
  }
}; 