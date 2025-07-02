import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const contactId = searchParams.get('contactId');

    if (!token || !contactId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the user with Clerk
    const { userId } = auth();
    if (!userId || userId !== token) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 401 }
      );
    }

    // Update user's email verification status in Clerk
    // Note: This is a placeholder - you'll need to implement the actual Clerk API call
    // to update the email verification status

    // Add email_verified tag in ActiveCampaign
    const tagResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/contactTags`, {
      method: 'POST',
      headers: {
        'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactTag: {
          contact: contactId,
          tag: "email_verified"
        }
      })
    });

    if (!tagResponse.ok) {
      const errorText = await tagResponse.text();
      console.error("[ACTIVECAMPAIGN] Failed to add email_verified tag:", {
        status: tagResponse.status,
        statusText: tagResponse.statusText,
        response: errorText
      });
      throw new Error(`ActiveCampaign API error: ${errorText}`);
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/verification-success', process.env.NEXT_PUBLIC_APP_URL));
  } catch (error) {
    console.error('Error in verify endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    );
  }
} 