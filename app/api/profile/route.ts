import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, bio, twitch, youtube, instagram, twitter, isPublic } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if the profile exists
    const existingProfile = await db.profile.findUnique({
      where: { userId },
    });

    const profileData = {
      name,
      bio: bio || null,
      twitch: twitch || null,
      youtube: youtube || null,
      instagram: instagram || null,
      twitter: twitter || null,
      isPublic: isPublic !== undefined ? isPublic : existingProfile?.isPublic ?? false
    };

    let updatedProfile;
    if (existingProfile) {
      // Update existing profile
      updatedProfile = await db.profile.update({
        where: { userId },
        data: profileData,
      });
    } else {
      // Create new profile
      updatedProfile = await db.profile.create({
        data: {
          userId,
          ...profileData,
        },
      });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}