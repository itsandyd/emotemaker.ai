import { db } from "@/lib/db";
import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export const maxDuration = 300;

export const dynamic = 'force-dynamic';

// Initialize fal client
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    // Validate input
    if (!image) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    console.log('Removing background from image:', image);

    // Extract the original URL if it's already proxied
    let imageUrl = image;
    if (image.includes('/api/proxy-image?url=')) {
      imageUrl = decodeURIComponent(image.split('/api/proxy-image?url=')[1]);
    }

    const result = await fal.subscribe("fal-ai/birefnet/v2", {
      input: {
        image_url: imageUrl
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('Background removal progress:', update.status);
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('Background removal result:', result);

    // Check the correct path in the response structure
    if (!result.data?.image?.url) {
      throw new Error('No image URL in response');
    }

    return NextResponse.json({
      image: {
        url: result.data.image.url
      }
    });

  } catch (error) {
    console.error('[FAL_BG_REMOVE_ERROR]', error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error", 
      { status: 500 }
    );
  }
}