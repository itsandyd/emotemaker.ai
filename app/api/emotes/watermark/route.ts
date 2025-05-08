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

    // Apply watermark - using a path-based approach that doesn't rely on fonts
    const watermarkedBuffer = await sharp(imageBuffer)
      .resize(1048, 1048) // Resize to a standard size
      .composite([{
        input: Buffer.from(`
          <svg width="1048" height="1048" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="black" flood-opacity="0.8"/>
              </filter>
            </defs>
            <!-- Text converted to path to avoid font issues -->
            <g filter="url(#shadow)" transform="translate(524, 524)">
              <path d="M-250 0 L-230 0 L-230 -60 L-170 -60 L-170 0 L-150 0 L-150 -60 L-90 -60 L-90 0 L-70 0 L-70 -60 L-10 -60 L-10 0 L10 0 L10 -60 L70 -60 L70 0 L90 0 L90 -60 L150 -60 L150 0 L170 0 L170 -60 L230 -60 L230 0 L250 0 L250 -80 L-250 -80 Z" fill="white" stroke="black" stroke-width="8"/>
              <path d="M-250 20 L-250 80 L-190 80 L-190 20 Z M-170 20 L-170 80 L-110 80 L-110 20 Z M-90 20 L-90 80 L-30 80 L-30 20 Z M-10 20 L-10 80 L50 80 L50 20 Z M70 20 L70 80 L130 80 L130 20 Z M150 20 L150 80 L210 80 L210 20 Z M230 20 L230 80 L250 80 L250 20 Z" fill="white" stroke="black" stroke-width="8"/>
            </g>
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