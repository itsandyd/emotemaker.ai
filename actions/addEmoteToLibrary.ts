'use server'

import { auth } from "@clerk/nextjs/server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/db";

interface EmoteData {
  prompt?: string;
  imageUrl: string;
  style: string;
  isVideo?: boolean;
}

export async function addEmoteToLibrary(emoteData: EmoteData) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const newEmote = await db.emote.create({
      data: {
        prompt: emoteData.prompt,
        style: emoteData.style,
        imageUrl: emoteData.imageUrl,
        userId: userId,
        isVideo: emoteData.isVideo || false,
      },
    });

    revalidatePath('/showcase');
    return { success: true, emote: newEmote };
  } catch (error) {
    console.error('Error adding emote to library:', error);
    return { success: false, error: 'Failed to add emote to library' };
  }
}