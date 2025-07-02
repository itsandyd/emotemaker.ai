import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2022-11-15",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    if (!session?.metadata?.emoteForSaleId || !session?.metadata?.userId) {
      return new NextResponse("Missing metadata", { status: 400 });
    }

    try {
      // Get the emote for sale
      const emoteForSale = await db.emoteForSale.findUnique({
        where: {
          id: session.metadata.emoteForSaleId
        },
        include: {
          emote: true
        }
      });

      if (!emoteForSale) {
        return new NextResponse("Emote for sale not found", { status: 404 });
      }

      // Create a purchase record
      await db.purchase.create({
        data: {
          userId: session.metadata.userId,
          emoteForSaleId: session.metadata.emoteForSaleId,
          paymentIntentId: session.payment_intent as string,
        }
      });

      // Add the emote to the user's collection via UserEmote
      await db.userEmote.create({
        data: {
          userId: session.metadata.userId,
          emoteId: emoteForSale.emoteId,
        }
      });

      return new NextResponse("Webhook received and processed", { status: 200 });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
} 