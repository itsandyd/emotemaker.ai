import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { auth } from "@clerk/nextjs/server";
import { checkApiLimit } from "@/lib/api-limit";
import { incrementApiLimit } from "@/lib/api-limit";
import { db } from "@/lib/db";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userCredits = await db.user.findUnique({
      where: { id: userId },
    });
  
    if (!userCredits || userCredits.credits < 5) {
      return new NextResponse("Insufficient credits (5 credits required)", { status: 403 });
    }

    const { prompt, image_url, duration = "5", aspect_ratio = "16:9" } = await req.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!image_url) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    // Configure fal client
    fal.config({
      credentials: process.env.FAL_KEY
    });

    const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
      input: {
        prompt,
        image_url,
        duration,
        aspect_ratio
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(update.logs.map((log) => log.message));
        }
      },
    });

    // Deduct credits after successful generation
    await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: 5
        }
      }
    });

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[KLING_VIDEO_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 