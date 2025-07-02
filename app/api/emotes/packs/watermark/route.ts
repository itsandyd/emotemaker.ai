import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import axios from 'axios';
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { emotePackId, imageUrl } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!emotePackId || !imageUrl) {
      return new NextResponse("Emote Pack ID and Image URL are required", { status: 400 });
    }

    // Verify the pack exists and belongs to the user
    const emotePack = await db.emotePack.findUnique({
      where: { id: emotePackId },
    });

    if (!emotePack) {
      return new NextResponse("Emote pack not found", { status: 404 });
    }

    if (emotePack.userId !== userId) {
      return new NextResponse("You don't have permission to modify this pack", { status: 403 });
    }

    // Fetch the original image data
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);

    // Use environment variable for the base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const watermarkUrl = `${baseUrl}/watermark.png`;
    
    // Fetch watermark image
    const watermarkResponse = await axios.get(watermarkUrl, { responseType: 'arraybuffer' });
    const watermarkBuffer = Buffer.from(watermarkResponse.data);

    // Apply watermark - keeping PNG format for transparency
    const watermarkedBuffer = await sharp(imageBuffer)
      .resize(500, 500) // Resize to a standard size
      .composite([{
        input: watermarkBuffer,
        gravity: 'center',
      }])
      .png({ compressionLevel: 9 }) // Use maximum PNG compression to reduce file size
      .toBuffer();

    return new NextResponse(watermarkedBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.log("[WATERMARK_PACK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 