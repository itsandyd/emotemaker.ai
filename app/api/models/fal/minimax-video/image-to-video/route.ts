import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import AWS from "aws-sdk";
import { env } from "@/env.mjs";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// Define the FAL API response type
interface FalVideoResponse {
  video: {
    url: string;
  };
}

// Define input type
interface FalVideoInput {
  prompt: string;
  image_url: string;
  prompt_optimizer?: boolean;
}

fal.config({
  credentials: process.env.FAL_KEY,
});

async function uploadImageToFal(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const file = new File([blob], 'image.png', { type: blob.type });
    return await fal.storage.upload(file);
  } catch (error) {
    console.error('Error uploading image to FAL:', error);
    throw error;
  }
}

async function uploadVideoToS3(videoUrl: string): Promise<string> {
  try {
    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer'
    });
    const videoBuffer = Buffer.from(response.data);

    const s3 = new AWS.S3({
      credentials: {
        accessKeyId: env.ACCESS_KEY_ID,
        secretAccessKey: env.SECRET_ACCESS_KEY,
      },
      region: "us-east-1",
    });

    const BUCKET_NAME = "pprcanvas";
    const videoId = uuidv4();

    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: videoId,
      Body: videoBuffer,
      ContentType: "video/mp4",
    }).promise();

    return `https://${BUCKET_NAME}.s3.amazonaws.com/${videoId}`;
  } catch (error) {
    console.error('Error uploading video to S3:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { prompt, image_url, prompt_optimizer = true } = body;
    const { userId } = auth();

    if (!image_url || !prompt || !userId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const userCredits = await db.user.findUnique({
      where: { id: userId },
    });
  
    if (!userCredits || userCredits.credits < 5) {
      return new NextResponse("Insufficient credits (5 credits required)", { status: 403 });
    }

    let falImageUrl;
    try {
      falImageUrl = await uploadImageToFal(image_url);
    } catch (error) {
      console.error('Error uploading image to FAL:', error);
      return new NextResponse(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 400 });
    }

    const result = await fal.subscribe(
      "fal-ai/minimax-video/image-to-video",
      {
        input: {
          prompt,
          image_url: falImageUrl,
          prompt_optimizer
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS" && update.logs) {
            console.log("FAL API update:", update.logs);
          }
        },
      }
    );

    // Upload the video to S3
    let s3VideoUrl;
    try {
      s3VideoUrl = await uploadVideoToS3(result.data.video.url);

      // Save as an emote with video type
      const emote = await db.emote.create({
        data: {
          userId,
          prompt,
          imageUrl: image_url,    // Original image
          videoUrl: s3VideoUrl,   // Generated video
          style: "video",         // Mark as video type
          model: "minimax",       // Video generation model
          createdAt: new Date(),
        },
      });

      // Deduct credits
      await db.user.update({
        where: { id: userId },
        data: { credits: userCredits.credits - 5 },
      });

      return NextResponse.json({
        video: {
          url: s3VideoUrl
        },
        emote: emote
      });

    } catch (error) {
      console.error('Error handling video:', error);
      return new NextResponse("Failed to process video", { status: 500 });
    }

  } catch (error: any) {
    console.error('[FAL_MINIMAX_VIDEO_ERROR]', error);
    if (error.body && error.body.detail) {
      console.error('Error details:', error.body.detail);
    }
    return new NextResponse(error.message || "Internal Server Error", { status: error.status || 500 });
  }
} 