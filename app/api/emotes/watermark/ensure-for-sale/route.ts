import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { emoteId } = await req.json();

    if (!emoteId) {
      return new NextResponse("Emote ID is required", { status: 400 });
    }

    // Fetch the original Emote to get required fields
    const originalEmote = await db.emote.findUnique({
      where: { id: emoteId },
      include: {
        emoteForSale: true
      }
    });

    if (!originalEmote) {
      return new NextResponse("Emote not found", { status: 404 });
    }

    if (!originalEmote.imageUrl || !originalEmote.prompt) {
      return new NextResponse("Emote is missing required fields", { status: 400 });
    }

    // Check if an EmoteForSale record already exists
    if (originalEmote.emoteForSale) {
      return NextResponse.json(originalEmote.emoteForSale);
    }

    // Create a new EmoteForSale record
    const emoteForSale = await db.emoteForSale.create({
      data: {
        imageUrl: originalEmote.imageUrl,
        prompt: originalEmote.prompt || "Untitled Emote",
        emote: { connect: { id: emoteId } },
        price: 0, // Set a default price
        style: originalEmote.style ?? "",
        model: originalEmote.model ?? "",
        user: { connect: { id: userId } },
      },
    });

    return NextResponse.json(emoteForSale);
  } catch (error: unknown) {
    console.error('[ENSURE_EMOTE_FOR_SALE_ERROR]', error);
    
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return new NextResponse(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 