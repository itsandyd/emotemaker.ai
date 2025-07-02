import { db } from "@/lib/db";
import { cache } from 'react'
import { Emote } from "@prisma/client";

// Base interface for emote fetching options
interface EmoteFetchOptions {
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
  sortBy?: 'createdAt' | 'prompt';
  sortOrder?: 'asc' | 'desc';
  filterByType?: string;
}

// Enhanced error types for better error handling
export class EmoteFetchError extends Error {
  constructor(
    message: string, 
    public code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'DATABASE_ERROR' | 'VALIDATION_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'EmoteFetchError';
  }
}

// Define types based on actual schema
type EmoteWithForSale = Emote & {
  emoteForSale?: {
    id: string;
    price: number | null;
    status: string;
  } | null;
};

// Basic backward-compatible function
export async function fetchUserEmotes(userId: string): Promise<Emote[]> {
  try {
    if (!userId) {
      throw new EmoteFetchError('User ID is required', 'VALIDATION_ERROR', 400);
    }

    const emotes = await db.emote.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        emoteForSale: {
          select: {
            id: true,
            price: true,
            status: true,
          }
        }
      }
    });

    return emotes;
  } catch (error) {
    console.error('Error fetching user emotes:', error);
    
    if (error instanceof EmoteFetchError) {
      throw error;
    }
    
    throw new EmoteFetchError(
      'Failed to fetch user emotes',
      'DATABASE_ERROR',
      500
    );
  }
}

// Enhanced function with comprehensive options
export async function fetchUserEmotesWithOptions(
  userId: string, 
  options: EmoteFetchOptions = {}
): Promise<{
  emotes: EmoteWithForSale[];
  total: number;
  hasMore: boolean;
}> {
  try {
    if (!userId) {
      throw new EmoteFetchError('User ID is required', 'VALIDATION_ERROR', 400);
    }

    const {
      limit = 50,
      offset = 0,
      includeMetadata = true,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filterByType
    } = options;

    // Build where clause
    const whereClause: any = {
      userId: userId,
    };

    if (filterByType) {
      whereClause.style = filterByType;
    }

    // Get total count for pagination
    const total = await db.emote.count({
      where: whereClause
    });

    // Fetch emotes with options
    const emotes = await db.emote.findMany({
      where: whereClause,
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit,
      skip: offset,
      include: includeMetadata ? {
        emoteForSale: {
          select: {
            id: true,
            price: true,
            status: true,
            type: true,
          }
        }
      } : undefined
    });

    const hasMore = offset + limit < total;

    return {
      emotes,
      total,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching user emotes with options:', error);
    
    if (error instanceof EmoteFetchError) {
      throw error;
    }
    
    throw new EmoteFetchError(
      'Failed to fetch user emotes with options',
      'DATABASE_ERROR',
      500
    );
  }
}

// Optimized function specifically for editor performance
export async function fetchUserEmotesForEditor(userId: string): Promise<Emote[]> {
  try {
    if (!userId) {
      throw new EmoteFetchError('User ID is required', 'VALIDATION_ERROR', 400);
    }

    // Fetch only essential data for editor performance
    const emotes = await db.emote.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100, // Limit for performance
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        createdAt: true,
        userId: true,
        style: true,
        model: true,
        videoUrl: true,
        originalCreatorId: true,
        isVideo: true,
        postedToInstagram: true
      }
    });

    return emotes;
  } catch (error) {
    console.error('Error fetching user emotes for editor:', error);
    
    if (error instanceof EmoteFetchError) {
      throw error;
    }
    
    throw new EmoteFetchError(
      'Failed to fetch user emotes for editor',
      'DATABASE_ERROR',
      500
    );
  }
}

// Utility function to prefetch emotes (for caching)
export async function prefetchUserEmotes(userId: string): Promise<void> {
  try {
    // This can be used for background prefetching
    await fetchUserEmotesForEditor(userId);
  } catch (error) {
    // Silently fail for prefetch operations
    console.warn('Prefetch emotes failed:', error);
  }
}

// Cache with different revalidation periods for different use cases
export const revalidate = 120; // Default revalidation

// Export cache busting function for real-time updates
export const invalidateUserEmotesCache = (userId: string) => {
  // In a real implementation, you'd invalidate specific cache keys
  console.log(`Invalidating emotes cache for user: ${userId}`);
};