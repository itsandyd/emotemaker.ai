import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

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

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get current user for email
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    const url = new URL(req.url);
    const emoteId = url.searchParams.get("emoteId");

    if (!emoteId) {
      return new NextResponse("Emote ID is required", { status: 400 });
    }

    // Find the emote for sale
    const emoteForSale = await db.emoteForSale.findUnique({
      where: {
        id: emoteId,
      },
      include: {
        emote: true,
        user: { 
          include: { 
            profile: true 
          } 
        },
      },
    });

    if (!emoteForSale) {
      return new NextResponse("Emote not found", { status: 404 });
    }

    // Check if user already owns this emote
    const existingUserEmote = await db.userEmote.findUnique({
      where: {
        userId_emoteId: {
          userId,
          emoteId: emoteForSale.emoteId
        }
      }
    });

    if (existingUserEmote) {
      return new NextResponse("You already own this emote", { status: 400 });
    }

    // Ensure there's a price
    if (!emoteForSale.stripePriceId && !emoteForSale.stripePriceAmount) {
      return new NextResponse("Emote not available for purchase", { status: 400 });
    }

    const priceInCents = emoteForSale.stripePriceAmount || Math.round((emoteForSale.price || 5) * 100);
    
    if (priceInCents < MINIMUM_PRICE) {
      return new NextResponse(`Emote price must be at least $${MINIMUM_PRICE / 100}`, { status: 400 });
    }

    const { applicationFee, platformRevenue, sellerRevenue } = calculateFees(priceInCents);
    
    // Check if seller has connected their Stripe account
    const sellerStripeAccount = emoteForSale.user?.profile?.stripeConnectAccountId;
    
    let sessionOptions: Stripe.Checkout.SessionCreateParams = {
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/emote/${emoteForSale.emoteId}?purchased=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/emote/${emoteForSale.emoteId}?canceled=true`,
      mode: "payment" as const,
      payment_method_types: ["card"],
      billing_address_collection: "auto" as const,
      line_items: emoteForSale.stripePriceId 
        ? [
            {
              price: emoteForSale.stripePriceId,
              quantity: 1,
            }
          ]
        : [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: emoteForSale.prompt || "Custom Emote",
                  description: `${emoteForSale.style || ""} style emote`,
                  images: [emoteForSale.watermarkedUrl || emoteForSale.imageUrl],
                },
                unit_amount: priceInCents,
              },
              quantity: 1,
            }
          ],
      metadata: {
        userId,
        emoteForSaleId: emoteForSale.id,
        sellerId: emoteForSale.userId || "",
        platformRevenue: platformRevenue.toString(),
        sellerRevenue: sellerRevenue.toString(),
      },
    };

    // Add customer email if available
    if (userEmail) {
      sessionOptions.customer_email = userEmail;
    }

    // Only add transfer data if we have a valid seller account
    // We now handle this in a try/catch to ensure fallback functionality
    let session;
    try {
      if (sellerStripeAccount) {
        // Try to create session with Connect transfer data
        session = await stripe.checkout.sessions.create({
          ...sessionOptions,
          payment_intent_data: {
            application_fee_amount: applicationFee,
            transfer_data: {
              destination: sellerStripeAccount,
            },
          },
        } as Stripe.Checkout.SessionCreateParams);
      } else {
        // If no seller account, create regular session
        session = await stripe.checkout.sessions.create(sessionOptions);
      }
    } catch (error) {
      console.log("[CONNECT_ACCOUNT_ERROR]", error);
      
      // If the Connect transfer fails, fall back to a regular session
      // This happens when the seller's account doesn't have the required capabilities
      session = await stripe.checkout.sessions.create(sessionOptions);
      
      // Log this for later manual processing if needed
      console.log("[FALLBACK_TO_DIRECT_PAYMENT] Will need manual processing for seller payment", {
        emoteId: emoteForSale.id,
        sellerId: emoteForSale.userId,
        amount: sellerRevenue
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[STRIPE_PURCHASE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
