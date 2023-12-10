import { checkApiLimit, getApiLimitCount, incrementApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512", emotion, additionalAttributes, hair, eyecolor} = body;

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

    if (!emotion) {
      return new NextResponse("Emotion is required", { status: 400 });
    }

    if (!additionalAttributes) {
      return new NextResponse("Additional Attributes are required", { status: 400 });
    }

    if (!hair) {
      return new NextResponse("Hair style is required", { status: 400 });
    }

    if (!eyecolor) {
      return new NextResponse("Eye color is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const finalPrompt = `Create a single anime-style emote icon of a character with ${hair} hair style and color, ${eyecolor} eye color, and ${additionalAttributes}. The character should express ${emotion} emotion. Focus on the character’s facial features to vividly convey the emotion, with exaggerated anime-style eyes and mouth. The background should be simple or transparent to keep the emphasis on the emote.`

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: finalPrompt,
        size: "1024x1024",
        quality: "standard",
        // n: amount,
        // size: resolution,
      });

    console.log(response.data[0].url);

    if (!isPro) {
      await incrementApiLimit();
    }
    
    // Return the response data
    return NextResponse.json(response.data);
  } catch (error) {
    console.log('[IMAGE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};