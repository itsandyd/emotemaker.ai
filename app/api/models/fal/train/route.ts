import { auth } from "@clerk/nextjs/server";
import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

fal.config({
  credentials: process.env.FAL_KEY,
});

export const maxDuration = 300; // Set maximum duration to 300 seconds (5 minutes)

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const zipFile = formData.get('images_zip') as File;

    if (!zipFile) {
      return new NextResponse("No zip file provided", { status: 400 });
    }

    try {
      // Upload the zip file to FAL storage
      const uploadedUrl = await fal.storage.upload(zipFile);

      console.log("Uploaded zip URL:", uploadedUrl);

      const result = await fal.queue.submit("fal-ai/flux-lora-general-training", {
        input: {
          images_data_url: uploadedUrl,
          steps: 500,
          rank: 16,
          learning_rate: 0.0004,
          caption_dropout_rate: 0.05,
        },
      });

      console.log("FAL API submit result:", result);

      return NextResponse.json(result);
    } catch (falError: any) {
      console.error('FAL API Error:', falError);
      if (falError.body && falError.body.detail) {
        console.error('Error details:', JSON.stringify(falError.body.detail, null, 2));
      }
      return new NextResponse(JSON.stringify({
        error: "Error submitting training job",
        details: falError.message || "Unknown error",
        status: falError.status
      }), { status: falError.status || 500 });
    }
  } catch (error) {
    console.error('[TRAINING_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}