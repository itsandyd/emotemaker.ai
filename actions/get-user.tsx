'use server'

import { db } from "../lib/db";

type UserProps = {
  userId: string;
  name?: string;
  email?: string;
};

async function addToActiveCampaign(name: string, email: string) {
  if (!process.env.ACTIVECAMPAIGN_API_URL || !process.env.ACTIVECAMPAIGN_API_KEY) {
    console.error("ActiveCampaign credentials not configured");
    return;
  }

  try {
    // First create the contact
    const createResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/contacts`, {
      method: 'POST',
      headers: {
        'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          email: email,
          firstName: name,
          list: process.env.ACTIVECAMPAIGN_LIST_ID
        }
      })
    });

    if (!createResponse.ok) {
      throw new Error(`ActiveCampaign API error: ${createResponse.statusText}`);
    }

    const contactData = await createResponse.json();
    const contactId = contactData.contact.id;

    // Then add the tag
    const tagResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/contactTags`, {
      method: 'POST',
      headers: {
        'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactTag: {
          contact: contactId,
          tag: process.env.ACTIVECAMPAIGN_TAG_ID
        }
      })
    });

    if (!tagResponse.ok) {
      console.error("Failed to add tag to contact:", await tagResponse.text());
    }

    console.log("User added to ActiveCampaign with tag");
  } catch (error) {
    console.error("Failed to add user to ActiveCampaign:", error);
  }
}

export const getUser = async ({ userId, name, email }: UserProps) => {
  try {
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    let user;
    if (!existingUser) {
      user = await db.user.create({
        data: { id: userId, name, email },
      });
      
      // Only add to ActiveCampaign if we have both name and email
      if (name && email) {
        await addToActiveCampaign(name, email);
      }
    } else {
      user = await db.user.update({
        where: { id: userId },
        data: { name, email },
      });
    }

    return user;
  } catch (error) {
    console.log("[GET_USER] Error:", error);
    return null;
  }
}