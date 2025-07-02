import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, image_url, mask_url } = await req.json();

    if (!prompt || !image_url || !mask_url) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const result = await fal.subscribe("fal-ai/inpaint", {
      input: {
        model_name: "diffusers/stable-diffusion-xl-1.0-inpainting-0.1",
        prompt,
        image_url,
        mask_url,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs!.map((log) => log.message).forEach(console.log);
        }
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[INPAINT_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}