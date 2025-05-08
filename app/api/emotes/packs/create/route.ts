import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { name, description, imageUrl, coverEmoteId } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Create a new emote pack
    // Only include imageUrl and coverEmoteForSaleId if they are provided
    const data: any = {
      name,
      description: description || '',
      price: 0, // Default price, will be updated later
      userId,
      status: "DRAFT",
    };

    // Only add imageUrl and coverEmoteForSaleId if they're provided
    if (imageUrl) {
      data.imageUrl = imageUrl;
    }
    
    if (coverEmoteId) {
      data.coverEmoteForSaleId = coverEmoteId;
    }

    const emotePack = await db.emotePack.create({
      data
    });

    return NextResponse.json(emotePack);
  } catch (error) {
    console.error('[CREATE_EMOTE_PACK_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 