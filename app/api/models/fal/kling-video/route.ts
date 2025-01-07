import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { auth } from "@clerk/nextjs/server";
import { checkApiLimit } from "@/lib/api-limit";
import { incrementApiLimit } from "@/lib/api-limit";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const freeTrial = await checkApiLimit();
    if (!freeTrial) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
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

    await incrementApiLimit();

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[KLING_VIDEO_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 