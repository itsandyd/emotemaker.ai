import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch all published emotes for this user
    const publishedEmotes = await db.emoteForSale.findMany({
      where: { 
        userId,
        status: "PUBLISHED"
      },
      include: {
        emote: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      publishedEmotes,
    });
  } catch (error) {
    console.log("[GET_PUBLISHED_EMOTES_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 