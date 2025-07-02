'use server'


import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "../lib/db";

export async function createBoard(title: string) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const board = await db.board.create({
    data: {
      title,
      userId,
      orgId: null, // Set this if you're using organizations
      authorId: userId,
      authorName: null, // You might want to fetch the user's name from Clerk here
    }
  });

  revalidatePath(`/tools/whiteboard/${board.id}`);
  return board;
}