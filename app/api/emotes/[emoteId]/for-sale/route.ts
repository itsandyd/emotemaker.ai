import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { emoteId: string } }
) {
  try {
    const { emoteId } = params;

    if (!emoteId) {
      return NextResponse.json(
        { error: "Emote ID is required" },
        { status: 400 }
      );
    }

    const emote = await db.emoteForSale.findUnique({
      where: {
        id: emoteId,
      },
      include: {
        emote: true,
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!emote) {
      return NextResponse.json(
        { error: "Emote not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ emote });
  } catch (error) {
    console.error("[GET_EMOTE_FOR_SALE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 