import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { absoluteUrl } from "@/lib/utils";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const settingsUrl = absoluteUrl("/");

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    const { searchParams } = new URL(req.url);
    const referral = searchParams.get("referral");

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSubscription = await db.userSubscription.findUnique({
      where: {
        userId
      }
    })

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      })

      return new NextResponse(JSON.stringify({ url: stripeSession.url }))
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "EmoteMaker.ai Pro Plan",
              description: "Generate unique emotes with a single prompt. For $485/year, receive 6000 credits to create custom emotes."
            },
            unit_amount: 48500,
            recurring: {
              interval: "year"
            }
          },
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      metadata: {
        userId,
        referral: referral || null,
      },
    })

    return new NextResponse(JSON.stringify({ url: stripeSession.url }))
  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}