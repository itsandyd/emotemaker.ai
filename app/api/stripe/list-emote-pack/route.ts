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
    const { emotePackId, price, watermarkedUrl, emoteIds, coverEmoteId } = await req.json();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!emotePackId || !price || !watermarkedUrl || !emoteIds || !Array.isArray(emoteIds)) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const emotePack = await db.emotePack.findUnique({
      where: { id: emotePackId, userId },
      include: {
        emotePackItems: {
          include: {
            emoteForSale: true
          }
        }
      },
    });

    if (!emotePack) {
      return new NextResponse("Emote pack not found", { status: 404 });
    }

    // Verify all emotes are published and valid
    const emoteForSaleList = await db.emoteForSale.findMany({
      where: {
        id: {
          in: emoteIds
        },
        userId,
        status: "PUBLISHED"
      }
    });

    if (emoteForSaleList.length !== emoteIds.length) {
      return new NextResponse("Some emotes are not valid or published", { status: 400 });
    }

    let stripeProduct;
    let stripePrice;

    const priceInCents = Math.round(price * 100);
    if (priceInCents < MINIMUM_PRICE) {
      return new NextResponse(JSON.stringify({ error: `Emote pack price must be at least $${MINIMUM_PRICE / 100}` }), { status: 400 });
    }

    // Handle Stripe product
    if (emotePack.stripeProductId) {
      // Update existing product
      stripeProduct = await stripe.products.update(emotePack.stripeProductId, {
        name: `Emote Pack: ${emotePack.name}`,
        description: emotePack.description || `Pack containing ${emoteIds.length} emotes`,
        images: [watermarkedUrl],
      });
    } else {
      // Create new product
      stripeProduct = await stripe.products.create({
        name: `Emote Pack: ${emotePack.name}`,
        description: emotePack.description || `Pack containing ${emoteIds.length} emotes`,
        images: [watermarkedUrl],
      });
    }

    // Always create a new price
    stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: priceInCents,
      currency: 'usd',
    });

    // Update the emotePack in the database
    const updatedEmotePack = await db.emotePack.update({
      where: { id: emotePackId },
      data: {
        price,
        watermarkedUrl,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        stripePriceAmount: priceInCents,
        stripePriceCurrency: 'usd',
        status: 'PUBLISHED',
      },
    });

    // If coverEmoteId is provided, update it in a separate operation
    if (coverEmoteId) {
      try {
        await db.emotePack.update({
          where: { id: emotePackId },
          data: {
            coverEmoteForSaleId: coverEmoteId
          }
        });
      } catch (error) {
        console.error("[COVER_EMOTE_UPDATE_ERROR]", error);
        // Continue even if this fails, since it's not critical
      }
    } else if (coverEmoteId === "") {
      // If coverEmoteId is explicitly an empty string, clear the field
      try {
        await db.emotePack.update({
          where: { id: emotePackId },
          data: {
            coverEmoteForSaleId: null
          }
        });
      } catch (error) {
        console.error("[CLEAR_COVER_EMOTE_ERROR]", error);
        // Continue even if this fails, since it's not critical
      }
    }

    // Update or create emote pack items
    // First, delete existing items
    await db.emotePackItem.deleteMany({
      where: { emotePackId }
    });

    // Then, create new items
    const emotePackItemPromises = emoteIds.map(emoteForSaleId => 
      db.emotePackItem.create({
        data: {
          emotePackId,
          emoteForSaleId,
        }
      })
    );

    await Promise.all(emotePackItemPromises);

    return new NextResponse(JSON.stringify({ success: true, emotePack: updatedEmotePack }));
  } catch (error) {
    console.log("[STRIPE_LIST_EMOTE_PACK_ERROR]", error);
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    } else {
      return new NextResponse(JSON.stringify({ error: "An unknown error occurred" }), { status: 500 });
    }
  }
} 