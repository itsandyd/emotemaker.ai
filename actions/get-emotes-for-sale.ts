"use server";

import { db } from "@/lib/db";
import { Prisma, EmoteStatus } from "@prisma/client";

export const getEmotesForSale = async ({
  page = 1,
  itemsPerPage = 20,
  search = ''
}: {
  page?: number;
  itemsPerPage?: number;
  search?: string;
}) => {
  const skip = (page - 1) * itemsPerPage;

  const whereClause: Prisma.EmoteForSaleWhereInput = {
    status: EmoteStatus.PUBLISHED,
    ...(search ? {
      OR: [
        { prompt: { contains: search } },
        { prompt: { contains: search.toLowerCase() } },
        { prompt: { contains: search.toUpperCase() } },
      ],
    } : {}),
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

  return { emotesForSale, totalCount };
};