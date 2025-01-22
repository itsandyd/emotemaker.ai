import { cache } from "react";
import { db } from "../lib/db";
import { Emote } from "@prisma/client";

export const getEmotes = cache(async ({ userId }: { userId: string | null }) => {
  try {
    console.log("Fetching emotes for userId:", userId); // Add this log
    const emotes = await db.emote.findMany({
      where: {
        userId: userId,
      },
      include: {
        emoteForSale: true,
        users: {
          include: {
            user: true
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      }
    });
    console.log("Fetched emotes:", emotes); // Add this log
    return { emotes };
  } catch (error) {
    console.error("[GET_EMOTES] Error:", error);
    return { emotes: [] };
  }
});

// Set the revalidation period (e.g., 120 seconds)
export const revalidate = 120;
