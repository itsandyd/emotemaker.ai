import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Fetching profile for user:", userId);
    const profile = await db.profile.findUnique({
      where: { userId: userId },
    });

    console.log("Profile:", profile);

    if (profile?.stripeConnectAccountId) {
      console.log("Verifying Stripe account:", profile.stripeConnectAccountId);
      try {
        const account = await stripe.accounts.retrieve(profile.stripeConnectAccountId);
        console.log("Stripe account verified:", account.id);
        
        // Check if all requirements are met
        if (account.requirements?.currently_due?.length === 0 && account.details_submitted) {
          console.log("Creating login link for existing Stripe account:", profile.stripeConnectAccountId);
          const loginLink = await stripe.accounts.createLoginLink(profile.stripeConnectAccountId);
          console.log("Login link created:", loginLink.url);
          return new NextResponse(JSON.stringify({ url: loginLink.url }));
        } else {
          console.log("Account onboarding not completed, creating new account link");
          const accountLink = await stripe.accountLinks.create({
            account: profile.stripeConnectAccountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
            type: 'account_onboarding',
          });
          return new NextResponse(JSON.stringify({ url: accountLink.url }));
        }
      } catch (error) {
        console.error("Stripe error:", error);
        if (error instanceof Stripe.errors.StripeError) {
          if (error.code === 'account_invalid') {
            console.log("Stored Stripe account is invalid, creating a new one");
            return await createNewStripeAccount(userId);
          }
        }
        return new NextResponse(JSON.stringify({ error: "Failed to verify Stripe account or create link", details: error instanceof Error ? error.message : String(error) }), { status: 500 });
      }
    } else {
      return await createNewStripeAccount(userId);
    }
  } catch (error) {
    console.error("[STRIPE_CONNECT_ERROR]", error);
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : "An unknown error occurred", stack: error instanceof Error ? error.stack : undefined }), { status: 500 });
  }
}

// The createNewStripeAccount function remains unchanged
async function createNewStripeAccount(userId: string) {
  try {
    console.log("Creating Stripe account for user:", userId);
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: {requested: true},
        transfers: {requested: true},
      },
    });
    console.log("Stripe account created:", account.id);

    console.log("Updating user profile with Stripe account ID");
    await db.profile.update({
      where: { userId: userId },
      data: { stripeConnectAccountId: account.id },
    });

    console.log("Creating account link");
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
      type: 'account_onboarding',
    });

    console.log("Returning account link URL");
    return new NextResponse(JSON.stringify({ url: accountLink.url }));
  } catch (error) {
    console.error("Error in createNewStripeAccount:", error);
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : "An unknown error occurred in createNewStripeAccount", stack: error instanceof Error ? error.stack : undefined }), { status: 500 });
  }
}