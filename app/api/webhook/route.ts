import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { SubscriptionType } from "@prisma/client";

// Map price IDs to subscription types and credits
const priceIdToSubInfo: { [priceId: string]: { credits: number, type: SubscriptionType } } = {
  // Monthly plans
  'price_1Q8GL9IlERZTJMCm1b6Nuebe': { credits: 150, type: 'BASIC' },    // Creator plan (monthly)
  'price_1OjApHIlERZTJMCmkGtSk4Wf': { credits: 300, type: 'LEGACY' },   // old plan
  'price_1Q8GLiIlERZTJMCm1QFpLRh3': { credits: 500, type: 'STANDARD' }, // Pro plan (monthly)
  'price_1Q8GM2IlERZTJMCmgwEbI5tO': { credits: 1250, type: 'PREMIUM' }, // Team plan (monthly)
  
  // Annual plans
  'price_1PTXsjIlERZTJMCmk9e50tI7': { credits: 1800, type: 'BASIC' },    // Creator plan (annually)
  'price_1PTXt2IlERZTJMCmQYmhHVQV': { credits: 6000, type: 'STANDARD' }, // Pro plan (annually)
  'price_1PTXtHIlERZTJMCmVgzahz20': { credits: 15000, type: 'PREMIUM' }, // Team plan (annually)
};

// Helper function to get credits and subscription type
const getSubInfo = (priceId: string) => {
  return priceIdToSubInfo[priceId] || { credits: 0, type: 'FREE' };
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        if (!session?.metadata?.userId) {
          return new NextResponse("User id is required", { status: 400 });
        }

        // Handle emote purchases
        if (session.metadata.emoteForSaleId) {
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
              console.error("Emote for sale not found", session.metadata.emoteForSaleId);
            } else {
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
              
              console.log(`Emote ${emoteForSale.emoteId} purchased by user ${session.metadata.userId}`);
            }
          } catch (error) {
            console.error("Error processing emote purchase:", error);
          }
          
          // Return successful response for emote purchases
          return new NextResponse(null, { status: 200 });
        }

        // Retrieve the line items from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        if (!lineItems || !lineItems.data || lineItems.data.length === 0) {
          return new NextResponse("No line items found", { status: 400 });
        }

        if (!lineItems.data[0].price) {
          return new NextResponse("Price not found in line items", { status: 400 });
        }

        const priceId = lineItems.data[0].price.id;
        const { credits: creditsToAdd, type: subscriptionType } = getSubInfo(priceId);

        // Update user with credits and subscription type
        await db.user.update({
          where: { id: session?.metadata?.userId },
          data: {
            credits: {
              increment: creditsToAdd,
            },
            subscriptionType,
            isActiveSubscriber: true,
          },
        });

        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await db.userSubscription.create({
            data: {
              userId: session?.metadata?.userId,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          });
        }
        break;

      case 'invoice.payment_succeeded':
        const subscriptionId = session.subscription as string;

        if (!subscriptionId) {
          return new NextResponse("Subscription id is required", { status: 400 });
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const invoicePriceId = subscription.items.data[0].price.id;
        const { credits: creditsToAddInvoice, type: invoiceSubscriptionType } = getSubInfo(invoicePriceId);

        // Retrieve the userSubscription record to get the userId
        const userSubscription = await db.userSubscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        await db.userSubscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: invoicePriceId,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          },
        });

        if (userSubscription) {
          // Update user with credits and subscription type
          await db.user.update({
            where: { id: userSubscription.userId },
            data: {
              credits: {
                increment: creditsToAddInvoice,
              },
              subscriptionType: invoiceSubscriptionType,
              isActiveSubscriber: true,
            },
          });
        }
        break;

      case 'invoice.payment_failed':
        const failedSubscriptionId = (event.data.object as Stripe.Invoice).subscription as string;
        
        if (!failedSubscriptionId) {
          return new NextResponse("Subscription id is required", { status: 400 });
        }

        // Find the user subscription
        const failedUserSubscription = await db.userSubscription.findUnique({
          where: { stripeSubscriptionId: failedSubscriptionId },
        });

        if (failedUserSubscription) {
          // Mark the user as inactive if payment failed
          await db.user.update({
            where: { id: failedUserSubscription.userId },
            data: {
              isActiveSubscriber: false,
            },
          });
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        // Find the user subscription
        const deletedUserSubscription = await db.userSubscription.findUnique({
          where: { stripeSubscriptionId: deletedSubscription.id },
        });

        if (deletedUserSubscription) {
          // Update the user subscription status
          await db.userSubscription.update({
            where: { stripeSubscriptionId: deletedSubscription.id },
            data: {
              stripeCurrentPeriodEnd: new Date(deletedSubscription.current_period_end * 1000),
            },
          });

          // Reset the user to FREE plan
          await db.user.update({
            where: { id: deletedUserSubscription.userId },
            data: {
              isActiveSubscriber: false,
              subscriptionType: 'FREE',
            },
          });
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        
        // Check if subscription is active, past due, or canceled
        const status = updatedSubscription.status;
        const isActive = status === 'active' || status === 'trialing';
        
        // Get new price ID and subscription type
        const updatedPriceId = updatedSubscription.items.data[0].price.id;
        const { type: updatedSubscriptionType } = getSubInfo(updatedPriceId);
        
        // Find the user subscription
        const updatedUserSubscription = await db.userSubscription.findUnique({
          where: { stripeSubscriptionId: updatedSubscription.id },
        });

        if (updatedUserSubscription) {
          // Update subscription details
          await db.userSubscription.update({
            where: { stripeSubscriptionId: updatedSubscription.id },
            data: {
              stripePriceId: updatedPriceId,
              stripeCurrentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
            },
          });

          // Update user subscription status
          await db.user.update({
            where: { id: updatedUserSubscription.userId },
            data: {
              isActiveSubscriber: isActive,
              subscriptionType: isActive ? updatedSubscriptionType : 'FREE',
            },
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`, error);
    return new NextResponse(`Webhook processing error: ${error.message}`, { status: 500 });
  }
}