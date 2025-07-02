import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const itemsPerPage = parseInt(url.searchParams.get("itemsPerPage") || "100");
    
    const skip = (page - 1) * itemsPerPage;

    const [emotesForSale, totalCount] = await Promise.all([
      db.emoteForSale.findMany({
        where: { userId },
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
        where: { userId },
      }),
    ]);

    return NextResponse.json({ emotesForSale, totalCount });
  } catch (error) {
    console.error("[USER_EMOTES_FOR_SALE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 