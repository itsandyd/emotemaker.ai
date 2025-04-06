'use server'

import { db } from "../lib/db";

type UserProps = {
  userId: string;
  name?: string;
  email?: string;
};

async function getTag(tagName: string) {
  if (!process.env.ACTIVECAMPAIGN_API_URL || !process.env.ACTIVECAMPAIGN_API_KEY) {
    console.error("ActiveCampaign credentials not configured");
    return null;
  }

  try {
    // First get all tags
    const searchResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/tags`, {
      headers: {
        'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Failed to fetch tags:", {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        response: errorText
      });
      return null;
    }

    const searchData = await searchResponse.json();
    console.log("All tags:", searchData);
    
    // Find the tag with exact name match
    const tag = searchData.tags?.find((tag: any) => tag.tag === tagName);
    
    if (tag) {
      console.log("Found tag:", tag);
      return tag.id;
    }

    console.error(`Tag '${tagName}' not found in available tags:`, searchData.tags?.map((t: any) => ({ id: t.id, name: t.tag })));
    return null;
  } catch (error) {
    console.error("Failed to get tag:", error);
    return null;
  }
}

async function triggerVerificationEmail(contactId: string) {
  if (!process.env.ACTIVECAMPAIGN_API_URL || !process.env.ACTIVECAMPAIGN_API_KEY) {
    console.error("ActiveCampaign credentials not configured");
    return;
  }

  try {
    const response = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/contacts/${contactId}/emailVerification`, {
      method: 'POST',
      headers: {
        'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to trigger verification email:", {
        status: response.status,
        statusText: response.statusText,
        response: errorText
      });
      return;
    }

    console.log("Verification email triggered successfully for contact:", contactId);
  } catch (error) {
    console.error("Error triggering verification email:", error);
  }
}

async function addToActiveCampaign(name: string, email: string, userId: string) {
  if (!process.env.ACTIVECAMPAIGN_API_URL || !process.env.ACTIVECAMPAIGN_API_KEY) {
    console.error("[ACTIVECAMPAIGN] Credentials not configured");
    return;
  }

  try {
    console.log("[ACTIVECAMPAIGN] Starting contact creation for:", email);
    
    // First create the contact
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
    console.log("[ACTIVECAMPAIGN] Contact created:", contactData);
    const contactId = contactData.contact.id;

    // Add contact to list
    if (process.env.ACTIVECAMPAIGN_LIST_ID) {
      console.log("[ACTIVECAMPAIGN] Adding contact to list");
      const listResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/contactLists`, {
        method: 'POST',
        headers: {
          'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactList: {
            list: process.env.ACTIVECAMPAIGN_LIST_ID,
            contact: contactId,
            status: 1
          }
        })
      });

      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.error("[ACTIVECAMPAIGN] Failed to add contact to list:", {
          status: listResponse.status,
          statusText: listResponse.statusText,
          response: errorText
        });
      } else {
        console.log("[ACTIVECAMPAIGN] Contact added to list successfully");
      }
    }

    // Get the existing Free Account tag
    console.log("[ACTIVECAMPAIGN] Getting Free Account tag");
    const tagId = await getTag('Free Account');
    if (!tagId) {
      console.error("[ACTIVECAMPAIGN] Failed to get Free Account tag");
      return;
    }

    // Add the tag to the contact
    console.log("[ACTIVECAMPAIGN] Adding Free Account tag");
    const tagResponse = await fetch(`${process.env.ACTIVECAMPAIGN_API_URL}/api/3/contactTags`, {
      method: 'POST',
      headers: {
        'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactTag: {
          contact: contactId,
          tag: tagId
        }
      })
    });

    if (!tagResponse.ok) {
      const errorText = await tagResponse.text();
      console.error("[ACTIVECAMPAIGN] Failed to add tag to contact:", {
        status: tagResponse.status,
        statusText: tagResponse.statusText,
        response: errorText
      });
    } else {
      console.log("[ACTIVECAMPAIGN] Free Account tag added successfully");
    }

    console.log("[ACTIVECAMPAIGN] User successfully added to ActiveCampaign");
  } catch (error) {
    console.error("[ACTIVECAMPAIGN] Error adding user to ActiveCampaign:", error);
    // Don't throw the error - we want to continue with user creation even if ActiveCampaign fails
  }
}

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getUser = async ({ userId, name, email }: UserProps) => {
  try {
    let user = null;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second delay between retries

    while (!user && retryCount < maxRetries) {
      try {
        console.log(`[GET_USER] Attempt ${retryCount + 1}: Looking for user ${userId}`);
        
        // Try to find the user first
        user = await db.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          console.log(`[GET_USER] User ${userId} not found, attempting to create`);
          try {
            user = await db.user.create({
              data: { 
                id: userId, 
                name, 
                email,
                emailVerified: null
              },
            });
            
            console.log(`[GET_USER] Successfully created user ${userId}`);
            break; // Successfully created user, exit loop
          } catch (error: any) {
            console.error(`[GET_USER] Error creating user:`, error);
            if (error.code === 'P2002') {
              console.log(`[GET_USER] User already exists (P2002), retrying...`);
              retryCount++;
              continue;
            } else {
              throw error;
            }
          }
        } else {
          console.log(`[GET_USER] Found existing user ${userId}, updating if needed`);
          // User exists, update it if name or email changed
          if (name !== user.name || email !== user.email) {
            user = await db.user.update({
              where: { id: userId },
              data: { name, email },
            });
            console.log(`[GET_USER] Updated user ${userId}`);
          }

          // Only add to ActiveCampaign if we have both name and email AND the user is verified
          if (name && email && user.emailVerified) {
            console.log(`[GET_USER] User is verified, adding to ActiveCampaign`);
            await addToActiveCampaign(name, email, userId);
          }
          break;
        }
      } catch (error: any) {
        console.error(`[GET_USER] Error in attempt ${retryCount + 1}:`, error);
        if (error.code === 'P2025') {
          retryCount++;
          await wait(retryDelay);
          continue;
        }
        throw error;
      }
    }

    if (!user) {
      console.error(`[GET_USER] Failed to get/create user ${userId} after ${maxRetries} attempts`);
      return null;
    }

    return user;
  } catch (error) {
    console.error("[GET_USER] Fatal error:", error);
    return null;
  }
}