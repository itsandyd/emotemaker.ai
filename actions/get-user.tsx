'use server'

import { db } from "../lib/db";

type UserProps = {
  userId: string;
  name?: string;
  email?: string;
};

export const getUser = async ({ userId, name, email }: UserProps) => {
  try {
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    let user;
    if (!existingUser) {
      user = await db.user.create({
        data: { id: userId, name, email },
      });
    } else {
      user = await db.user.update({
        where: { id: userId },
        data: { name, email },
      });
    }

    return user;
  } catch (error) {
    console.log("[GET_USER] Error:", error);
    return null;
  }
}