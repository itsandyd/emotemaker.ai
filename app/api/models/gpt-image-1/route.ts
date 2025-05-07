import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/oldsubscription";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { db } from "@/lib/db";
import { generateThemedEmotePrompt } from "@/app/features/editor/utils";
import AWS from "aws-sdk";
import { env } from "@/env.mjs";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export const maxDuration = 300;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    console.log('User ID:', userId);

    if (!userId) {
      console.error('Unauthorized: No user ID');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = userId as string;

    const body = await req.json();
    console.log('Request Body:', body);

    const { prompt, amount = 1, resolution = "1024x1024", emoteType } = body;
    console.log('Parsed Body:', { prompt, amount, resolution, emoteType });

    if (!openai.apiKey) {
      console.error('OpenAI API Key not configured');
      return new NextResponse("OpenAI API Key not configured.", { status: 500 });
    }

    if (!prompt) {
      console.error('Prompt is required');
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      console.error('Amount is required');
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      console.error('Resolution is required');
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const userCredits = await db.user.findUnique({
      where: { id: userId },
    });
    console.log('User Credits:', userCredits);

    if (userCredits && userCredits.credits > 0) {
      await db.user.update({
        where: { id },
        data: { credits: userCredits.credits - 1 },
      });
      console.log('Credits updated for user:', userId);
    }

    if (userCredits?.credits === 0) {
      console.error('User has run out of credits');
      return new NextResponse("You have run out of credits.", { status: 403 });
    }

    console.log('Emote Type:', emoteType);

    const finalPrompt = generateThemedEmotePrompt(prompt, emoteType);
    console.log('Final Prompt:', finalPrompt);

    if (!finalPrompt) {
      console.error('Final prompt is required');
      return new NextResponse("Final prompt is required", { status: 400 });
    }

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: finalPrompt,
      size: resolution,
      n: amount,
      background: "transparent",
      quality: "auto"
    });

    // Get the base64 image data
    if (!response.data?.[0]?.b64_json) {
      throw new Error("No image data in response");
    }
    const imageBytes = Buffer.from(response.data[0].b64_json, 'base64');

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

    // Generate unique filename
    const key = `emotes/${id}/${uuidv4()}.png`;

    // Upload to S3
    const uploadResult = await s3.upload({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: imageBytes,
      ContentType: 'image/png',
    }).promise();

    // Save to database
    const emote = await db.emote.create({
      data: {
        userId: id,
        prompt: prompt,
        style: emoteType,
        model: "gpt-image-1",
        imageUrl: uploadResult.Location,
        isVideo: false,
        originalCreatorId: id,
      },
    });

    // Return array with S3 URL
    return NextResponse.json([uploadResult.Location]);
  } catch (error) {
    console.error('[GPT_IMAGE_GENERATION_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 