import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import axios from 'axios';
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { emoteId, imageUrl } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!emoteId || !imageUrl) {
      return new NextResponse("Emote ID and Image URL are required", { status: 400 });
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

    // Apply watermark
    const watermarkedBuffer = await sharp(imageBuffer)
      .resize(500, 500) // Resize to a standard size
      .composite([{
        input: watermarkBuffer,
        gravity: 'center',
      }])
      .toBuffer();

    return new NextResponse(watermarkedBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.log("[WATERMARK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}