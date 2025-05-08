import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    let emote = null;
    let emoteListing = null;

    // First, try to find the Emote
    emote = await db.emote.findUnique({
      where: { id },
      include: { emoteForSale: true },
    });

    // If not found, try to find the EmoteForSale
    if (!emote) {
      emoteListing = await db.emoteForSale.findUnique({
        where: { id },
        include: { emote: true },
      });

      if (emoteListing) {
        emote = { ...emoteListing.emote, emoteForSale: emoteListing };
      }
    }

    if (!emote) {
      return NextResponse.json(
        { error: 'Emote not found' },
        { status: 404 }
      );
    }

    // Get price from emoteForSale if available
    const price = emote.emoteForSale?.price || 0;
    const prompt = emote.prompt || emote.emoteForSale?.prompt || 'Untitled';
    
    // Transform emote data to match the expected format for the client
    const formattedEmote = {
      id: emote.id,
      name: prompt,
      imageUrl: emote.imageUrl || emote.emoteForSale?.imageUrl,
      description: prompt,
      price: price,
      style: emote.style,
      model: emote.model,
      createdAt: emote.createdAt,
      type: "static", // Default to static, could be determined from metadata
      tags: emote.style ? [emote.style] : [],
      createdWith: emote.model || "AI Model",
      creator: "EmoteMaker.ai"
    };

    // Fetch similar emotes (basic implementation)
    const similarEmotes = await db.emote.findMany({
      where: {
        style: emote.style,
        id: { not: emote.id }
      },
      take: 4,
      include: {
        emoteForSale: true
      }
    });

    const formattedSimilarEmotes = similarEmotes.map(similar => ({
      id: similar.id,
      name: similar.prompt || 'Similar Emote',
      imageUrl: similar.imageUrl,
      price: similar.emoteForSale?.price || 0,
      style: similar.style
    }));

    return NextResponse.json({
      emote: formattedEmote,
      similarEmotes: formattedSimilarEmotes
    });
  } catch (error) {
    console.error('Error fetching emote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emote details' },
      { status: 500 }
    );
  }
} 