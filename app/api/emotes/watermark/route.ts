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

    // Create a simple white semi-transparent overlay with basic text
    const watermarkSvg = Buffer.from(`
      <svg width="1048" height="1048">
        <rect x="349" y="499" width="350" height="50" fill="rgba(255,255,255,0.7)" />
        <rect x="349" y="499" width="350" height="50" fill="none" stroke="black" stroke-width="2" />
        <rect x="359" y="509" width="30" height="30" fill="black" />
        <rect x="399" y="509" width="30" height="30" fill="black" />
        <rect x="439" y="509" width="30" height="30" fill="black" />
        <rect x="479" y="509" width="30" height="30" fill="black" />
        <rect x="519" y="509" width="30" height="30" fill="black" />
        <rect x="559" y="509" width="30" height="30" fill="black" />
        <rect x="599" y="509" width="30" height="30" fill="black" />
        <rect x="639" y="509" width="30" height="30" fill="black" />
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