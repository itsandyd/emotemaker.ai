import { checkApiLimit, getApiLimitCount, incrementApiLimit } from "@/lib/api-limit";
import { db } from "@/lib/db";
import { checkSubscription } from "@/lib/oldsubscription";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from 'openai';

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
    const { prompt, amount = 1, resolution = "512x512"} = body;

//     type Template = {
//       value: string;
//       label: string;
//       prompt: string;
//     };
    
//     const selectedTemplate = templates.find((t: Template) => t.value === template);

// if (!selectedTemplate) {
//   // Handle the case where no matching template was found
//   // For example, you might return an error response
//   return new NextResponse("Invalid template", { status: 400 });
// }

// const finalPrompt = selectedTemplate.prompt.replace('${prompt}', prompt);

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

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

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

    const finalPrompt = `Design a vibrant, cartoonish digital object icon, featuring the object '${prompt}'. The object icon should creatively and clearly represent the object, making it easily identifiable at a small scale. The background of the object icon should be solid white, ensuring it stands out and remains visually clear. The style should be playful and engaging, with a distinct and cohesive appearance, perfect for enhancing the visual appeal.`

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: finalPrompt,
        size: "1024x1024",
        quality: "standard",
    });

    if (!response.data || response.data.length === 0) {
        return new NextResponse("Failed to generate image", { status: 500 });
    }

    console.log(response.data[0].url);
    
    // Return the response data
    return NextResponse.json(response.data);
  } catch (error) {
    console.log('[IMAGE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};