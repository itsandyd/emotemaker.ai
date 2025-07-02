import { checkSubscription } from "@/lib/subscription";
import { checkApiLimit, getApiLimitCount, incrementApiLimit } from "@/lib/api-limit";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { db } from "@/lib/db";

export const maxDuration = 300;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1 } = body;


    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API Key not configured.", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    // if (!resolution) {
  //   return new NextResponse("Resolution is required", { status: 400 });
    // }

    // if (!emotion) {
    //   return new NextResponse("Emotion is required", { status: 400 });
    // }

    // if (!additionalAttributes) {
    //   return new NextResponse("Additional Attributes are required", { status: 400 });
    // }

    // const freeTrial = await checkApiLimit();
    // const isPro = await checkSubscription();
  
    const userCredits = await db.user.findUnique({
      where: { id: userId },
    });
  
    if (userCredits && userCredits.credits > 0) {
      await db.user.update({
        where: { id: userId },
        data: { credits: userCredits.credits - 1 },
      });
    }

    if (userCredits?.credits === 0) {
      return new NextResponse("You have run out of credits.")
    }

    // if (!freeTrial && !isPro) {
    //   return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    // }

    const finalPrompt = `Design a chibi-style Twitch emote of a '${prompt}'. Emphasize the playful and adorable aspects of the design using exaggerated proportions—large heads and small bodies—and vibrant colors. Ensure the emote maintains clarity and expressiveness at smaller sizes for optimal visibility in Twitch chat. The background should be transparent or a solid color.`

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      size: '1024x1024',
      quality: "standard",
      // response_format: "b64_json"
      // n: amount,
      // size: resolution,
    });

    if (!response.data || response.data.length === 0) {
        return new NextResponse("Failed to generate image", { status: 500 });
    }

    console.log(response.data[0].b64_json);
    console.log(response.data[0].url);

    // if (!isPro) {
    //   await incrementApiLimit();
    // }
    
    // Return the response data
    return NextResponse.json(response.data);
    // return NextResponse.json(response.data.map(item => item.b64_json));
  } catch (error) {
    console.log('[IMAGE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};