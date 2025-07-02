import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { absoluteUrl } from "@/lib/utils";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const settingsUrl = absoluteUrl("/");

// Define the price ID and product ID for the Team plan
const TEAM_PLAN_PRICE_ID = 'price_1Q8GM2IlERZTJMCmgwEbI5tO';
const TEAM_PLAN_PRODUCT_ID = 'prod_R0GtY7x2wW2P2D';

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
          price: TEAM_PLAN_PRICE_ID,
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
  } catch (error: unknown) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : String(error)
      }), 
      { status: 500 }
    );
  }
}