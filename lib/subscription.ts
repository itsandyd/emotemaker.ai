"use server"

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";


const DAY_IN_MS = 86_400_000;

export const checkSubscription = async (userId?: string | null) => {
  if (!userId) {
    const { userId: authUserId } = auth();
    userId = authUserId;
  }

  if (!userId) {
    return false;
  }

  const userSubscription = await db.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  })

  if (!userSubscription) {
    return false;
  }

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()

  return !!isValid;
};