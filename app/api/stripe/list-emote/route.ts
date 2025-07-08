import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

const settingsUrl = absoluteUrl("/profile");

const MINIMUM_PRICE = 100; // $1.00 in cents

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    const { emoteId, price, watermarkedUrl } = await req.json();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const emote = await db.emote.findUnique({
      where: { id: emoteId, userId },
      include: { emoteForSale: true },
    });

    if (!emote) {
      return new NextResponse("Emote not found", { status: 404 });
    }

    let stripeProduct;
    let stripePrice;

    if (emote.emoteForSale && emote.emoteForSale.stripeProductId) {
      // Update existing product and price
      stripeProduct = await stripe.products.update(emote.emoteForSale.stripeProductId, {
        name: `Emote: ${emote.prompt}`,
        description: `${emote.style} style emote created with ${emote.model}`,
        images: [watermarkedUrl], // Use the watermarked URL
      });
    } else {
      // Create new product
      stripeProduct = await stripe.products.create({
        name: `Emote: ${emote.prompt}`,
        description: `${emote.style} style emote created with ${emote.model}`,
        images: [watermarkedUrl], // Use the watermarked URL
      });
    }

    // Always create a new price
    stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: 'usd',
    });

    const priceInCents = Math.round(price * 100);
    if (priceInCents < MINIMUM_PRICE) {
      return new NextResponse(JSON.stringify({ error: `Emote price must be at least $${MINIMUM_PRICE / 100}` }), { status: 400 });
    }

    const emoteForSale = await db.emoteForSale.upsert({
      where: { emoteId: emote.id },
      update: {
        imageUrl: emote.imageUrl!,
        watermarkedUrl: watermarkedUrl, // Use the watermarked URL
        prompt: emote.prompt!,
        price: price,
        style: emote.style,
        model: emote.model,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        stripePriceAmount: Math.round(price * 100),
        stripePriceCurrency: 'usd',
        status: 'MARKETPLACE_PUBLISHED',
      },
      create: {
        emoteId: emote.id,
        imageUrl: emote.imageUrl!,
        watermarkedUrl: watermarkedUrl, // Use the watermarked URL
        prompt: emote.prompt!,
        price: price,
        style: emote.style,
        model: emote.model,
        userId: userId,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        stripePriceAmount: Math.round(price * 100),
        stripePriceCurrency: 'usd',
        status: 'MARKETPLACE_PUBLISHED',
      },
    });

    return new NextResponse(JSON.stringify({ success: true, emoteForSale }));
  } catch (error) {
    console.log("[STRIPE_LIST_EMOTE_ERROR]", error);
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    } else {
      return new NextResponse(JSON.stringify({ error: "An unknown error occurred" }), { status: 500 });
    }
  }
}