import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

const MINIMUM_PRICE = 100; // $1.00 in cents
const CONNECT_FEE_PERCENTAGE = 0.0025; // 0.25% for Stripe Connect
const CONNECT_FIXED_FEE = 25; // $0.25 for Stripe Connect
const PLATFORM_FEE_PERCENTAGE = 0.15; // 15% platform fee
const STRIPE_PROCESSING_PERCENTAGE = 0.029; // 2.9% Stripe processing fee
const STRIPE_FIXED_FEE = 30; // $0.30 Stripe fixed processing fee

// Updated fee structure function
function calculateFees(priceInCents: number): { applicationFee: number, platformRevenue: number, sellerRevenue: number } {
  // Calculate Stripe's processing fee
  const stripeProcessingFee = Math.round(priceInCents * STRIPE_PROCESSING_PERCENTAGE + STRIPE_FIXED_FEE);

  // Calculate Stripe Connect fee
  const connectFee = Math.round(priceInCents * CONNECT_FEE_PERCENTAGE + CONNECT_FIXED_FEE);

  // Calculate platform fee
  const platformFee = Math.round(priceInCents * PLATFORM_FEE_PERCENTAGE);

  // Calculate total application fee (Connect fee + platform fee)
  const applicationFee = connectFee + platformFee;

  // Platform revenue
  const platformRevenue = platformFee;

  // Calculate seller revenue (amount remaining after all fees)
  const sellerRevenue = priceInCents - stripeProcessingFee - applicationFee;

  return { applicationFee, platformRevenue, sellerRevenue };
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);
    const emoteId = searchParams.get("emoteId");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!emoteId) {
      return new NextResponse("Emote ID is required", { status: 400 });
    }

    const emoteForSale = await db.emoteForSale.findUnique({
      where: { id: emoteId },
      include: { user: { include: { profile: true } } },
    });

    if (!emoteForSale || emoteForSale.price === null) {
      return new NextResponse("Emote not found or price not set", { status: 404 });
    }

    if (!emoteForSale.user?.profile?.stripeConnectAccountId) {
      return new NextResponse("Seller has not connected their Stripe account", { status: 400 });
    }

    const priceInCents = Math.round(emoteForSale.price * 100);
    if (priceInCents < MINIMUM_PRICE) {
      return new NextResponse(`Emote price must be at least $${MINIMUM_PRICE / 100}`, { status: 400 });
    }

    const { applicationFee, platformRevenue, sellerRevenue } = calculateFees(priceInCents);

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/emote/${emoteId}?success=true&payment_intent={PAYMENT_INTENT}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/emote/${emoteId}?canceled=true`,
      payment_method_types: ["card"],
      mode: "payment",
      billing_address_collection: "auto",
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: emoteForSale.prompt,
              images: [emoteForSale.watermarkedUrl || emoteForSale.imageUrl],
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: emoteForSale.user.profile.stripeConnectAccountId,
        },
      },
      metadata: {
        userId,
        emoteId: emoteForSale.id,
        sellerId: emoteForSale.userId,
        platformRevenue: platformRevenue.toString(),
        sellerRevenue: sellerRevenue.toString(),
      },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    console.log("[STRIPE_PURCHASE_EMOTE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
