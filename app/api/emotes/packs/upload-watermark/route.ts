import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import AWS from "aws-sdk";
import { env } from "@/env.mjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { imageBase64, emotePackId } = await req.json();

        if (!imageBase64 || !emotePackId) {
            return new NextResponse("Image data and Emote Pack ID are required", { status: 400 });
        }

        // Fetch the emote pack to verify it belongs to the user
        const emotePack = await db.emotePack.findUnique({
            where: { id: emotePackId },
        });

        if (!emotePack) {
            return new NextResponse("Emote pack not found", { status: 404 });
        }

        // Verify user owns this pack
        if (emotePack.userId !== userId) {
            return new NextResponse("You don't have permission to modify this pack", { status: 403 });
        }

        const s3 = new AWS.S3({
            credentials: {
                accessKeyId: env.ACCESS_KEY_ID,
                secretAccessKey: env.SECRET_ACCESS_KEY,
            },
            region: "us-east-1",
        });

        const BUCKET_NAME = "pprcanvas";
        // Use a short key for S3 to prevent URL length issues
        const randomId = Math.random().toString(36).substring(2, 10); // 8-character alphanumeric
        const imageId = `pack_wmk_${randomId}`; // Pack watermark prefix

        try {
            await s3
                .putObject({
                    Bucket: BUCKET_NAME,
                    Key: imageId,
                    Body: Buffer.from(imageBase64, 'base64'),
                    ContentEncoding: 'base64',
                    ContentType: 'image/png',
                })
                .promise();
        } catch (s3Error) {
            console.error('[S3_UPLOAD_ERROR]', s3Error);
            return new NextResponse("Failed to upload watermarked image to S3", { status: 500 });
        }

        // Generate the URL
        const watermarkedUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${imageId}`;

        try {
            // Update the emote pack with the watermarked URL
            const updatedEmotePack = await db.emotePack.update({
                where: { id: emotePackId },
                data: { watermarkedUrl },
            });

            return NextResponse.json({ watermarkedUrl: updatedEmotePack.watermarkedUrl });
        } catch (dbError) {
            console.error('[DB_ERROR]', dbError);
            
            // If database operation fails, try to delete the S3 object to clean up
            try {
                await s3.deleteObject({
                    Bucket: BUCKET_NAME,
                    Key: imageId,
                }).promise();
            } catch (deleteError) {
                console.error('[S3_DELETE_ERROR]', deleteError);
            }
            
            return new NextResponse("Database error when saving watermarked URL", { status: 500 });
        }
    } catch (error: unknown) {
        console.error('[UPLOAD_PACK_WATERMARK_ERROR]', error);
        
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        return new NextResponse(JSON.stringify({ error: errorMessage }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 