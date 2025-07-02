import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const contactId = searchParams.get("contactId");

    if (!token || !contactId) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // Verify the token with Clerk
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update user's email verification status in Clerk
    const user = await db.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });

    // Update ActiveCampaign contact status
    if (process.env.ACTIVECAMPAIGN_API_URL && process.env.ACTIVECAMPAIGN_API_KEY) {
      try {
        // Add email_verified tag
        const tagResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/contactTags`, {
          method: 'POST',
          headers: {
            'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contactTag: {
              contact: contactId,
              tag: 'email_verified'
            }
          })
        });

        if (!tagResponse.ok) {
          console.error("Failed to add email_verified tag to contact");
        }
      } catch (error) {
        console.error("Error updating ActiveCampaign contact:", error);
      }
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/verification-success', req.url));
  } catch (error) {
    console.error("[VERIFY_EMAIL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 