import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your webhook secret
  const wh = new Webhook(process.env.WEBHOOK_SECRET || '');

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'email.created') {
    // Temporarily type as any while we resolve the correct EmailJSON type
    const data = evt.data as any;
    const { to_email_address: toEmailAddress, subject, content: bodyHtml, text: bodyPlain } = data;

    try {
      // Create contact in ActiveCampaign if it doesn't exist
      const createResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/contacts`, {
        method: 'POST',
        headers: {
          'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: {
            email: toEmailAddress,
          }
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create contact in ActiveCampaign');
      }

      const contactData = await createResponse.json();
      const contactId = contactData.contact.id;

      // Send email through ActiveCampaign
      const emailResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/emails`, {
        method: 'POST',
        headers: {
          'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: {
            subject,
            html: bodyHtml,
            plaintext: bodyPlain,
            fromEmail: process.env.ACTIVECAMPAIGN_FROM_EMAIL,
            fromName: "EmoteMaker.ai",
            to: toEmailAddress
          }
        })
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send email through ActiveCampaign');
      }

      return new Response('Success', { status: 200 });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  return new Response('Success', { status: 200 });
} 