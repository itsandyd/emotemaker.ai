import { auth } from "@clerk/nextjs/server";
import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

fal.config({
  credentials: process.env.FAL_KEY,
});

// export const runtime = 'edge'; // Add this line

export const maxDuration = 300; // Set maximum duration to 60 seconds (1 minute)

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const requestId = url.searchParams.get('requestId');

    if (!requestId) {
      return new NextResponse("Missing requestId", { status: 400 });
    }

    try {
      const status = await fal.queue.status("fal-ai/flux-lora-general-training", {
        requestId,
        logs: true,
      });

      console.log("FAL status:", status);

      if (status.status === 'COMPLETED') {
        const result = await fal.queue.result("fal-ai/flux-lora-general-training", {
          requestId
        });
        console.log("FAL result:", result);
        return NextResponse.json({ status: status.status, result });
      }

      return NextResponse.json({ status: status.status });
    } catch (falError: any) {
      console.error('FAL API Error:', falError);
      if (falError.body && falError.body.detail) {
        console.error('Error details:', JSON.stringify(falError.body.detail, null, 2));
      }
      return NextResponse.json({
        error: "Error checking status",
        details: falError.message || "Unknown error",
        status: falError.status
      }, { status: falError.status || 500 });
    }
  } catch (error) {
    console.error('[STATUS_CHECK_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}