import { db } from "@/lib/db";
import * as fal from "@fal-ai/serverless-client";
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

    const result = await fal.subscribe("fal-ai/birefnet/v2", {
      input: {
        image_url: image
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log(result);


    // Optionally, you could save the request or response to a database here
    // await db.someModel.create({
    //   data: {
    //     image: image,
    //     result: result,
    //   }
    // });

    return NextResponse.json(result);

  } catch (error) {
    console.log('[FAL_BG_REMOVE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}