import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import AWS from "aws-sdk";
import { env } from "@/env.mjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { imageBase64, emoteId } = await req.json();

        if (!imageBase64 || !emoteId) {
            return new NextResponse("Image data and Emote ID are required", { status: 400 });
        }

        // Fetch the original Emote to get required fields
        const originalEmote = await db.emote.findUnique({
            where: { id: emoteId },
        });

        if (!originalEmote) {
            return new NextResponse("Emote not found", { status: 404 });
        }

        if (!originalEmote.imageUrl || !originalEmote.prompt) {
            return new NextResponse("Emote is missing required fields", { status: 400 });
        }

        const s3 = new AWS.S3({
            credentials: {
                accessKeyId: env.ACCESS_KEY_ID,
                secretAccessKey: env.SECRET_ACCESS_KEY,
            },
            region: "us-east-1",
        });

        const BUCKET_NAME = "pprcanvas";
        // Use a much shorter key for S3 to prevent URL length issues
        const randomId = Math.random().toString(36).substring(2, 10); // 8-character alphanumeric
        const imageId = `wmk_${randomId}`; // Even shorter prefix with underscore

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

        // Generate the shortest possible URL
        const watermarkedUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${imageId}`;

        try {
            // Check if an EmoteForSale record already exists
            const existingEmoteForSale = await db.emoteForSale.findUnique({
                where: { emoteId },
            });

            let updatedEmote;

            if (existingEmoteForSale) {
                // If it exists, update the watermarkedUrl
                updatedEmote = await db.emoteForSale.update({
                    where: { emoteId },
                    data: { watermarkedUrl },
                });
            } else {
                // If it doesn't exist, create a new EmoteForSale record
                updatedEmote = await db.emoteForSale.create({
                    data: {
                        watermarkedUrl,
                        imageUrl: originalEmote.imageUrl,
                        prompt: originalEmote.prompt,
                        emote: { connect: { id: emoteId } },
                        price: 0, // Set a default price
                        style: originalEmote.style ?? "",
                        model: originalEmote.model ?? "",
                        user: { connect: { id: userId } },
                    },
                });
            }

            return NextResponse.json({ watermarkedUrl: updatedEmote.watermarkedUrl });
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
        console.error('[UPLOAD_WATERMARK_ERROR]', error);
        
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
