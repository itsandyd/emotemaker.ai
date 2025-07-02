import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import { env } from "@/env.mjs";
import { v4 as uuidv4 } from "uuid"
import axios from "axios";
import { auth } from "@clerk/nextjs/server";

export const maxDuration = 300;

const prisma = new PrismaClient();

export async function POST(req: Request) {
  console.log('[SAVE_EMOTE] Starting emote save process');
  
  const { userId } = auth();
  
  if (!userId) {
    console.error('[SAVE_EMOTE_ERROR] Unauthorized: No user ID found');
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { prompt, imageUrl, style, model, isVideo } = await req.json();
  console.log('[SAVE_EMOTE] Received data:', { userId, prompt, style, model, isVideo });

  try {
    console.log('[SAVE_EMOTE] Fetching file from URL');
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);
    console.log('[SAVE_EMOTE] File fetched');

    const s3 = new AWS.S3({
      credentials: {
        accessKeyId: env.ACCESS_KEY_ID,
        secretAccessKey: env.SECRET_ACCESS_KEY,
      },
      region: "us-east-1",
    });

    const BUCKET_NAME = "pprcanvas";
    const fileId = uuidv4();
    const fileExtension = isVideo ? '.mp4' : '.gif';
    const contentType = isVideo ? 'video/mp4' : 'image/gif';
    const key = `${isVideo ? 'videos' : 'emotes'}/${fileId}${fileExtension}`;

    console.log(`[SAVE_EMOTE] Uploading ${isVideo ? 'video' : 'image'} to S3`);
    await s3
      .putObject({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      })
      .promise();
    console.log('[SAVE_EMOTE] File uploaded successfully');

    const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    console.log('[SAVE_EMOTE] S3 URL:', s3Url);

    console.log('[SAVE_EMOTE] Creating emote in database');
    const emote = await prisma.emote.create({
      data: {
        userId,
        prompt,
        imageUrl: s3Url,
        style,
        model,
        isVideo: isVideo || false,
        createdAt: new Date(),
      },
    });
    console.log('[SAVE_EMOTE] Emote created successfully:', emote);

    return NextResponse.json(emote);
  } catch (error) {
    console.error('[SAVE_EMOTE_ERROR] Detailed error:', error);
    return new NextResponse("Failed to create emote", { status: 500 });
  }
}