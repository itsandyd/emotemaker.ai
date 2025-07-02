import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateThemedEmotePrompt } from "@/app/features/editor/utils";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { prompt, aspect_ratio = "16:9", num_images = 1, emoteType } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Check if user has enough credits
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!dbUser || dbUser.credits < num_images) {
      return new NextResponse("Not enough credits", { status: 402 });
    }

    // Generate the themed prompt
    const finalPrompt = generateThemedEmotePrompt(prompt, emoteType);
    if (!finalPrompt) {
      return new NextResponse("Failed to generate themed prompt", { status: 400 });
    }

    // Generate image using Flux Pro 1.1 Ultra
    const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
      input: {
        prompt: finalPrompt,
        aspect_ratio: "1:1",
        num_images,
        enable_safety_checker: true,
        safety_tolerance: "2",
        output_format: "jpeg"
      },
      logs: true
    });

    if (!result.data?.images?.[0]?.url) {
      throw new Error("No image URL returned from Flux Pro 1.1 Ultra");
    }

    // Deduct credits
    await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: num_images
        }
      }
    });

    // Create emote records
    const emotes = await Promise.all(
      (result.data.images as { url: string }[]).map(async (image) => {
        return db.emote.create({
          data: {
            userId,
            prompt,
            imageUrl: image.url,
            isVideo: false,
            style: emoteType
          }
        });
      })
    );

    return NextResponse.json(emotes);
  } catch (error) {
    console.error("[FLUXPRO11ULTRA_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 