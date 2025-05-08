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

    // Fetch the image data
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);

    // Apply watermark
    const watermarkedBuffer = await sharp(imageBuffer)
      .resize(1048, 1048) // Resize to a standard size
      .composite([{
        input: Buffer.from(`
          <svg width="1048" height="1048">
            <style>
              .title { 
                fill: white; 
                font-size: 100px; 
                font-weight: bold; 
                font-family: 'Arial', sans-serif;
                text-transform: uppercase;
                letter-spacing: 2px;
                stroke: black;
                stroke-width: 12px;
                paint-order: stroke fill;
              }
            </style>
            <text x="50%" y="50%" text-anchor="middle" class="title">EmoteMaker.ai</text>
          </svg>`
        ),
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