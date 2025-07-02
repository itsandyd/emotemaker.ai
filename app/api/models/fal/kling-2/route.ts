import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { auth } from "@clerk/nextjs/server";
import { checkApiLimit } from "@/lib/api-limit";
import { incrementApiLimit } from "@/lib/api-limit";
import { db } from "@/lib/db";
import AWS from "aws-sdk";
import { env } from "@/env.mjs";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

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

    const result = await fal.subscribe("fal-ai/kling-video/v2/master/image-to-video", {
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

    console.log('Kling API Response:', JSON.stringify(result.data, null, 2));

    // Get the video URL from the result
    const videoUrl = result.data?.video?.url;
    console.log('Video URL:', videoUrl);
    
    if (!videoUrl) {
      console.error('Full result object:', JSON.stringify(result, null, 2));
      throw new Error("No video URL in response");
    }

    // Download the video from the URL
    const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(videoResponse.data, 'binary');

    // Configure AWS S3
    const s3 = new AWS.S3({
      credentials: {
        accessKeyId: env.ACCESS_KEY_ID,
        secretAccessKey: env.SECRET_ACCESS_KEY,
      },
      region: "us-east-1",
    });

    const BUCKET_NAME = "pprcanvas";
    if (!BUCKET_NAME) {
      throw new Error("AWS bucket name not configured");
    }

    // Generate unique filename for the video
    const key = `videos/${userId}/${uuidv4()}.mp4`;

    // Upload to S3
    const uploadResult = await s3.upload({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'video/mp4',
    }).promise();

    // Save to database
    const video = await db.emote.create({
      data: {
        userId,
        prompt,
        imageUrl: uploadResult.Location, // Using imageUrl field for video URL
        isVideo: true,
        model: "Kling 1.6"
      },
    });

    // Deduct credits after successful generation and storage
    await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: 5
        }
      }
    });

    // Return the S3 URL
    return NextResponse.json({ video_url: uploadResult.Location });
  } catch (error) {
    console.error("[KLING_VIDEO_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 