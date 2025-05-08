import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch all emotes created by this user
    const emotes = await db.emote.findMany({
      where: { 
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        emoteForSale: true,
      }
    });

    // Also fetch any emotes that are for sale by this user
    // (in case there are any that weren't created by them)
    const emotesForSale = await db.emoteForSale.findMany({
      where: {
        userId,
        NOT: {
          emoteId: {
            in: emotes.map(e => e.id)
          }
        }
      },
      include: {
        emote: true,
      }
    });

    // Combine both sets, transforming emoteForSale entries to match emote format
    const additionalEmotes = emotesForSale.map(efs => ({
      ...efs.emote,
      emoteForSale: efs
    }));

    const allEmotes = [...emotes, ...additionalEmotes];

    return NextResponse.json({
      emotes: allEmotes,
    });
  } catch (error) {
    console.log("[GET_ALL_EMOTES_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 