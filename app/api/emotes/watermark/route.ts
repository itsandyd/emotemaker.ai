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

    // Create an SVG with embedded font data
    // This approach includes the font data directly in the SVG, removing dependency on system fonts
    const watermarkSvg = Buffer.from(`
      <svg width="600" height="100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @font-face {
              font-family: 'EmbeddedSans';
              src: url('data:font/woff2;base64,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') format('woff2');
              font-weight: normal;
              font-style: normal;
            }
          </style>
        </defs>
        <rect width="600" height="100" fill="rgba(255,255,255,0.7)" rx="10" />
        <text x="300" y="65" font-family="EmbeddedSans" font-size="50" font-weight="bold" 
              text-anchor="middle" fill="black">EmoteMaker.ai</text>
      </svg>
    `);

    // Apply watermark
    const watermarkedBuffer = await sharp(imageBuffer)
      .resize(1048, 1048) // Resize to a standard size
      .composite([{
        input: watermarkSvg,
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