import { db } from "../lib/db";
import { cache } from 'react'
import { Emote, EmoteForSale, Prisma } from '@prisma/client';

export type EmoteWithForSale = Emote & {
  emoteForSale: EmoteForSale | null;
};

interface FetchUserEmotesOptions {
  page?: number;
  limit?: number;
  includeForSale?: boolean;
  type?: 'all' | 'images' | 'videos';
  sortBy?: 'newest' | 'oldest' | 'prompt';
}

interface FetchUserEmotesResult {
  emotes: EmoteWithForSale[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

// Basic fetch for backward compatibility
export const fetchUserEmotes = cache(async (userId: string): Promise<EmoteWithForSale[]> => {
  try {
    const emotes = await db.emote.findMany({
      where: {
        userId: userId,
      },
      include: {
        emoteForSale: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return emotes;
  } catch (error) {
    console.error('Error fetching user emotes:', error);
    throw new Error('Failed to fetch user emotes');
  }
});

// Enhanced fetch with pagination and filtering
export const fetchUserEmotesWithOptions = cache(async (
  userId: string, 
  options: FetchUserEmotesOptions = {}
): Promise<FetchUserEmotesResult> => {
  const {
    page = 1,
    limit = 50,
    includeForSale = true,
    type = 'all',
    sortBy = 'newest'
  } = options;

  try {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Prisma.EmoteWhereInput = {
      userId: userId,
    };

    // Add type filter
    if (type === 'images') {
      where.isVideo = false;
    } else if (type === 'videos') {
      where.isVideo = true;
    }

    // Build order by clause
    let orderBy: Prisma.EmoteOrderByWithRelationInput;
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'prompt':
        orderBy = { prompt: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Execute queries concurrently
    const [emotes, total] = await Promise.all([
      db.emote.findMany({
        where,
        include: includeForSale ? {
          emoteForSale: true,
        } : undefined,
        orderBy,
        skip,
        take: limit,
      }),
      db.emote.count({ where })
    ]);

    const hasMore = skip + emotes.length < total;

    return {
      emotes: emotes as EmoteWithForSale[],
      total,
      hasMore,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching user emotes with options:', error);
    throw new Error('Failed to fetch user emotes');
  }
});

// Fast fetch for editor (only essential data)
export const fetchUserEmotesForEditor = cache(async (userId: string): Promise<Emote[]> => {
  try {
    const emotes = await db.emote.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        isVideo: true,
        createdAt: true,
        userId: true,
        style: true,
        model: true,
        videoUrl: true,
        originalCreatorId: true,
        postedToInstagram: true
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit for performance in editor
    });
    
    return emotes;
  } catch (error) {
    console.error('Error fetching user emotes for editor:', error);
    throw new Error('Failed to fetch user emotes for editor');
  }
});

// Cache with different revalidation periods for different use cases
export const revalidate = 120; // Default revalidation

// Export cache busting function for real-time updates
export const invalidateUserEmotesCache = (userId: string) => {
  // In a real implementation, you'd invalidate specific cache keys
  console.log(`Invalidating emotes cache for user: ${userId}`);
};