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
        'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          email,
          firstName: name
        }
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("ActiveCampaign API error details:", {
        status: createResponse.status,
        statusText: createResponse.statusText,
        response: errorText
      });
      throw new Error(`ActiveCampaign API error: ${errorText}`);
    }

    const contactData = await createResponse.json();
    console.log("Contact created:", contactData);
    const contactId = contactData.contact.id;

    // Add contact to list
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
      console.error("Failed to add contact to list:", {
        status: listResponse.status,
        statusText: listResponse.statusText,
        response: errorText
      });
      throw new Error(`Failed to add contact to list: ${errorText}`);
    }

    // Get the existing Free Account tag
    const tagId = await getTag('Free Account');
    if (!tagId) {
      throw new Error('Failed to get Free Account tag');
    }

    // Add the tag to the contact
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
      console.error("Failed to add tag to contact:", {
        status: tagResponse.status,
        statusText: tagResponse.statusText,
        response: errorText
      });
      throw new Error(`Failed to add tag: ${errorText}`);
    }

    console.log("User added to ActiveCampaign with Free Account tag and list subscription");
  } catch (error) {
    console.error("Failed to add user to ActiveCampaign:", error);
    // Don't throw the error - we want to continue with user creation even if ActiveCampaign fails
  }
}

export const getUser = async ({ userId, name, email }: UserProps) => {
  try {
    let user = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (!user && retryCount < maxRetries) {
      try {
        // Try to find the user first
        user = await db.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          // User doesn't exist, try to create it
          try {
            user = await db.user.create({
              data: { id: userId, name, email },
            });
            
            // Only add to ActiveCampaign if we have both name and email
            if (name && email) {
              await addToActiveCampaign(name, email);
            }
            break; // Successfully created user, exit loop
          } catch (error: any) {
            if (error.code === 'P2002') {
              // If unique constraint error, user was created by another request
              // Continue loop to try finding it again
              retryCount++;
              continue;
            } else {
              throw error; // Re-throw other errors
            }
          }
        } else {
          // User exists, update it
          user = await db.user.update({
            where: { id: userId },
            data: { name, email },
          });
          break; // Successfully updated user, exit loop
        }
      } catch (error: any) {
        if (error.code === 'P2025') {
          // Record not found, retry
          retryCount++;
          continue;
        }
        throw error; // Re-throw other errors
      }
    }

    if (!user) {
      console.error(`Failed to get/create user after ${maxRetries} attempts`);
      return null;
    }

    return user;
  } catch (error) {
    console.log("[GET_USER] Error:", error);
    return null;
  }
}