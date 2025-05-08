import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch all emotes for sale by this user
    const emotesForSale = await db.emoteForSale.findMany({
      where: { 
        userId,
      },
      include: {
        emote: true,
      },
      orderBy: {
        updatedAt: "desc",
      }
    });

    return NextResponse.json({
      emotesForSale,
    });
  } catch (error) {
    console.log("[GET_EMOTES_FOR_SALE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 