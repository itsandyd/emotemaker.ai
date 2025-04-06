import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, name, userId } = await req.json();

    if (!email || !name || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create contact in ActiveCampaign
    const createResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/contacts`, {
      method: 'POST',
      headers: {
        'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          email,
          firstName: name,
          fieldValues: [
            {
              field: "1", // Assuming field 1 is for userId
              value: userId
            }
          ]
        }
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("[ACTIVECAMPAIGN] Contact creation failed:", {
        status: createResponse.status,
        statusText: createResponse.statusText,
        response: errorText
      });
      throw new Error(`ActiveCampaign API error: ${errorText}`);
    }

    const contactData = await createResponse.json();
    const contactId = contactData.contact.id;

    // Generate verification link
    const verificationUrl = new URL('/api/auth/verify', process.env.NEXT_PUBLIC_APP_URL);
    verificationUrl.searchParams.append('token', userId);
    verificationUrl.searchParams.append('contactId', contactId);

    // Send verification email through ActiveCampaign
    const emailResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/emailActivities`, {
      method: 'POST',
      headers: {
        'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailActivity: {
          contact: contactId,
          email: email,
          subject: "Verify your email address",
          htmlContent: `
            <h1>Welcome to EmoteMaker.ai!</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="${verificationUrl.toString()}">Verify Email Address</a></p>
            <p>If you did not create an account, you can safely ignore this email.</p>
          `,
          textContent: `
            Welcome to EmoteMaker.ai!
            
            Please verify your email address by clicking the link below:
            ${verificationUrl.toString()}
            
            If you did not create an account, you can safely ignore this email.
          `
        }
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("[ACTIVECAMPAIGN] Failed to send verification email:", {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        response: errorText
      });
      throw new Error(`ActiveCampaign API error: ${errorText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in verify-email endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process verification request' },
      { status: 500 }
    );
  }
} 