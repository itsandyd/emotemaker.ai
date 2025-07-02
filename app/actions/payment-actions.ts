'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any // Type casting to avoid TypeScript error with API version
});

interface PaymentIntentResult {
  purchaseId?: string;
  clientSecret?: string;
  error?: string;
}

export async function createPaymentIntent(emoteId: string): Promise<PaymentIntentResult> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return { error: 'Unauthorized - Please log in to purchase emotes' };
    }

    // Get emote information
    let emote = await db.emote.findUnique({
      where: { id: emoteId },
      include: { emoteForSale: true },
    });

    // If not found as Emote, try to find as EmoteForSale
    if (!emote) {
      const emoteListing = await db.emoteForSale.findUnique({
        where: { id: emoteId },
        include: { emote: true },
      });

      if (emoteListing) {
        emote = { ...emoteListing.emote, emoteForSale: emoteListing };
      } else {
        return { error: 'Emote not found' };
      }
    }

    // Get price information
    const price = emote.emoteForSale?.price || 0;
    const priceInCents = Math.round(price * 100);

    if (priceInCents <= 0) {
      return { error: 'Invalid price' };
    }

    // Create purchase record
    const purchase = await db.purchase.create({
      data: {
        userId,
        emoteForSaleId: emote.emoteForSale?.id || '',
        paymentIntentId: '', // Will be updated after creating the payment intent
      },
    });

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceInCents,
      currency: 'usd',
      metadata: {
        purchaseId: purchase.id,
        userId,
        emoteId: emote.id,
      },
    });

    // Update purchase with payment intent ID
    await db.purchase.update({
      where: { id: purchase.id },
      data: {
        paymentIntentId: paymentIntent.id,
      },
    });

    return {
      purchaseId: purchase.id,
      clientSecret: paymentIntent.client_secret ?? undefined,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { error: 'Failed to create payment intent' };
  }
} 