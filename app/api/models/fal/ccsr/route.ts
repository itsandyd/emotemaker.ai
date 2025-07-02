import { NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { image_url, ...options } = body;

        const result = await fal.subscribe("fal-ai/ccsr", {
            input: {
                image_url,
                ...options,
            },
            logs: true,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error processing CCSR request:', error);
        return NextResponse.json({ error: 'Failed to process the image' }, { status: 500 });
    }
}
