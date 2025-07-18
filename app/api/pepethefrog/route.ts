import { checkApiLimit, getApiLimitCount, incrementApiLimit } from "@/lib/api-limit";
import { db } from "@/lib/db";
import { checkSubscription } from "@/lib/oldsubscription";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from 'openai';
import toast from "react-hot-toast";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 300;

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt } = body;

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

    // if (!amount) {
    //   return new NextResponse("Amount is required", { status: 400 });
    // }

    // if (!resolution) {
    //   return new NextResponse("Resolution is required", { status: 400 });
    // }

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

    const finalPrompt = `Create a pepe the meme frog emote for the following prompt: ${prompt}`
    // const finalPromptX = `Create a pepe the meme frog emote featuring a ${prompt}. Include a simple solid background.`
    

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: finalPrompt,
        size: "1024x1024",
        // n: amount,
        // size: resolution,
      });

    if (!response.data || response.data.length === 0) {
        return new NextResponse("Failed to generate image", { status: 500 });
    }

    console.log(response.data[0].url);
    
    // Return the response data
    toast.success("Image generated");
    return NextResponse.json(response.data);
  } catch (error) {
    console.log('[IMAGE_ERROR]', error);
    toast.error("Internal Error");
    return new NextResponse("Internal Error", { status: 500 });
  }
};

