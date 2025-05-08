import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch paginated emote packs with their items
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
        skip: offset,
        take: limit,
      }),
    ]);

    const [totalCount, emotePacks] = emotePacksWithCount;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      emotePacks,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    console.log("[GET_EMOTE_PACKS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 