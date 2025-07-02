import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { emoteId: string } }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const emoteId = params.emoteId;

  try {
    // If userId is provided, fetch user-specific emote
    if (userId) {
      const userEmote = await db.emote.findUnique({
        where: {
          id: emoteId,
          userId: userId,
        },
        include: {
          emoteForSale: true,
        }
      });

      if (!userEmote) {
        return NextResponse.json({ error: 'Emote not found' }, { status: 404 });
      }

      return NextResponse.json({ emote: userEmote });
    } 
    // Otherwise, fetch marketplace emote
    else {
      let emote = null;
      let emoteListing = null;

      // First, try to find the Emote
      emote = await db.emote.findUnique({
        where: { id: emoteId },
        include: { emoteForSale: true },
      });

      // If not found, try to find the EmoteForSale
      if (!emote) {
        emoteListing = await db.emoteForSale.findUnique({
          where: { id: emoteId },
          include: { emote: true },
        });

        if (emoteListing) {
          emote = { ...emoteListing.emote, emoteForSale: emoteListing };
        }
      }

      if (!emote) {
        return NextResponse.json({ error: 'Emote not found' }, { status: 404 });
      }

      // Get price from emoteForSale if available
      const price = emote.emoteForSale?.price || 0;
      const prompt = emote.prompt || emote.emoteForSale?.prompt || 'Untitled';
      const imageUrl = emote.emoteForSale?.watermarkedUrl || emote.emoteForSale?.imageUrl || emote.imageUrl || null;
      
      // Transform emote data to match the expected format for the client
      const formattedEmote = {
        id: emote.id,
        name: prompt,
        imageUrl: imageUrl,
        description: `This premium ${emote.style || 'custom'} style emote is perfect for Twitch, Discord, and other streaming platforms. It's ready to use immediately after purchase.`,
        price: price,
        style: emote.style,
        model: emote.model,
        createdAt: emote.createdAt,
        type: emote.isVideo ? "animated" : "static",
        tags: emote.style ? [emote.style, prompt.split(' ')[0], "premium"] : [prompt.split(' ')[0], "premium"],
        createdWith: emote.model || "AI Technology",
        creator: "EmoteMaker.ai Design Team",
        emoteForSaleId: emote.emoteForSale?.id || null,
        watermarkedUrl: emote.emoteForSale?.watermarkedUrl || null
      };

      // Fetch similar emotes
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
        imageUrl: similar.emoteForSale?.watermarkedUrl || similar.emoteForSale?.imageUrl || similar.imageUrl,
        price: similar.emoteForSale?.price || 0,
        style: similar.style,
        emoteForSaleId: similar.emoteForSale?.id || null
      }));

      return NextResponse.json({
        emote: formattedEmote,
        similarEmotes: formattedSimilarEmotes
      });
    }
  } catch (error) {
    console.error('Failed to fetch emote:', error);
    return NextResponse.json({ error: 'Failed to fetch emote' }, { status: 500 });
  }
}
