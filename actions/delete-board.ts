'use server'

import { db } from "../lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteBoard(boardId: string) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const board = await db.board.findUnique({
    where: { id: boardId },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  if (board.userId !== userId) {
    throw new Error("You do not have permission to delete this board");
  }

  await db.board.delete({
    where: { id: boardId },
  });

  revalidatePath(`/tools/whiteboard`);
  return { message: "Board deleted successfully" };
}