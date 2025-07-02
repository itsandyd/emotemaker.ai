import { NextResponse } from "next/server";
import { fal} from "@fal-ai/client";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { image_url, upscaling_factor, overlapping_tiles, checkpoint } = body;
    const { userId } = auth();

    console.log("Received request body:", body);

    if (!image_url) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    // Remove the proxy from the image_url if it exists
    if (image_url.startsWith('http://localhost:3000/api/proxy-image?url=')) {
      image_url = decodeURIComponent(image_url.split('url=')[1]);
    }

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userCredits = await db.user.findUnique({
      where: { id: userId },
    });
  
    if (!userCredits || userCredits.credits <= 0) {
      return new NextResponse("Insufficient credits", { status: 403 });
    }

    const input = {
      image_url,
      upscaling_factor: upscaling_factor?.toString() || "4",
      overlapping_tiles: overlapping_tiles === "true",
      checkpoint: checkpoint || "v2",
    };

    console.log("Sending input to FAL API:", input);

    const result = await fal.subscribe("fal-ai/aura-sr", {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS" && update.logs) {
          console.log("FAL API update:", update.logs);
        }
      },
    });

    console.log("FAL API result:", result);

    await db.user.update({
      where: { id: userId },
      data: { credits: userCredits.credits - 1 },
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[FAL_AURA_SR_ERROR]', error);
    if (error.body && error.body.detail) {
      console.error('Error details:', error.body.detail);
    }
    return new NextResponse(error.message || "Internal Server Error", { status: error.status || 500 });
  }
}
