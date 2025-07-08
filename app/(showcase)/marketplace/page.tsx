import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db";
import Marketplace from "./_components/marketplace";
import ErrorFallback from "./_components/error-fallback";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { EmoteStatus, Prisma } from "@prisma/client";
import { getEmotePacks, GetEmotePacksResult } from "@/actions/get-emote-packs";

export const metadata: Metadata = {
  title: "EmoteMaker.ai - Marketplace",
  description: "Browse and purchase unique emotes created by our community.",
  openGraph: {
    title: "EmoteMaker.ai - Marketplace",
    description: "Browse and purchase unique emotes created by our community.",
    images: ["/og-marketplace.png"],
  },
};

interface MarketplaceSearchParams {
  page?: string;
  search?: string;
  style?: string;
  model?: string;
  priceRange?: string;
  sortBy?: string;
  tab?: string;
}

interface MarketplacePageProps {
  searchParams: MarketplaceSearchParams;
}

// Configuration constants
const ITEMS_PER_PAGE = 12;
const PACKS_PER_PAGE = 8;
const MAX_SEARCH_LENGTH = 100;

// Price range mappings
const PRICE_RANGES = {
  'under-5': { min: 0, max: 5 },
  '5-10': { min: 5, max: 10 },
  '10-20': { min: 10, max: 20 },
  'over-20': { min: 20, max: Number.MAX_SAFE_INTEGER },
} as const;

// Sort options
const SORT_OPTIONS = ['newest', 'oldest', 'price-low', 'price-high', 'popular'] as const;

// Helper functions
function validateSearchParams(searchParams: MarketplaceSearchParams) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const search = searchParams.search?.trim().slice(0, MAX_SEARCH_LENGTH) || '';
  const style = searchParams.style?.trim() || 'all';
  const model = searchParams.model?.trim() || 'all';
  const priceRange = searchParams.priceRange && searchParams.priceRange in PRICE_RANGES 
    ? searchParams.priceRange as keyof typeof PRICE_RANGES
    : null;
  const sortBy = SORT_OPTIONS.includes(searchParams.sortBy as any) 
    ? searchParams.sortBy as typeof SORT_OPTIONS[number]
    : 'newest';
  const tab = ['emotes', 'packs'].includes(searchParams.tab || '') 
    ? searchParams.tab as 'emotes' | 'packs'
    : 'emotes';

  return { page, search, style, model, priceRange, sortBy, tab };
}

function buildEmoteWhereClause(params: {
  search: string;
  style: string;
  model: string;
  priceRange: keyof typeof PRICE_RANGES | null;
}) {
  const where: Prisma.EmoteForSaleWhereInput = {
    status: EmoteStatus.MARKETPLACE_PUBLISHED,
  };

  // Search filter
  if (params.search) {
    where.OR = [
      { prompt: { contains: params.search } },
      { style: { contains: params.search } },
      { model: { contains: params.search } },
    ];
  }

  // Style filter
  if (params.style && params.style !== 'all') {
    where.style = params.style;
  }

  // Model filter
  if (params.model && params.model !== 'all') {
    where.model = params.model;
  }

  // Price range filter
  if (params.priceRange) {
    const range = PRICE_RANGES[params.priceRange];
    where.price = {
      gte: range.min,
      ...(range.max !== Number.MAX_SAFE_INTEGER && { lte: range.max }),
    };
  }

  return where;
}

function buildEmoteOrderBy(sortBy: string): Prisma.EmoteForSaleOrderByWithRelationInput {
  switch (sortBy) {
    case 'oldest':
      return { createdAt: 'asc' };
    case 'price-low':
      return { price: 'asc' };
    case 'price-high':
      return { price: 'desc' };
    case 'popular':
      // TODO: Implement popularity sorting based on purchase count
      return { createdAt: 'desc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}

const MarketplacePage = async ({ searchParams }: MarketplacePageProps) => {
  try {
    const { userId } = auth();
    
    if (!userId) {
      redirect('/sign-in');
    }

    // Validate and sanitize search parameters
    const validatedParams = validateSearchParams(searchParams);
    const { page, search, style, model, priceRange, sortBy, tab } = validatedParams;

    // Calculate pagination
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Build where clause for emotes
    const emoteWhere = buildEmoteWhereClause({ search, style, model, priceRange });
    const orderBy = buildEmoteOrderBy(sortBy);

    // Fetch data in parallel for better performance
    const [
      emotesForSale,
      totalEmotes,
      userEmotes,
      packsData,
      // Get unique styles and models for filter options
      availableStyles,
      availableModels,
    ] = await Promise.all([
      // Main emotes query
      db.emoteForSale.findMany({
        where: emoteWhere,
        include: {
          emote: true,
        },
        orderBy,
        skip,
        take: ITEMS_PER_PAGE,
      }),

      // Count total emotes
      db.emoteForSale.count({
        where: emoteWhere,
      }),

      // User's emotes for purchase validation
      db.emote.findMany({
        where: {
          userId,
        },
        include: {
          emoteForSale: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100, // Limit to prevent excessive data loading
      }),

      // Emote packs
      getEmotePacks({
        userId: "",
        page: tab === "packs" ? page : 1,
        itemsPerPage: tab === "packs" ? PACKS_PER_PAGE : 6,
        status: EmoteStatus.MARKETPLACE_PUBLISHED,
      }),

      // Get unique styles for filter dropdown
      db.emoteForSale.findMany({
        where: {
          status: EmoteStatus.MARKETPLACE_PUBLISHED,
          style: { not: null },
        },
        select: {
          style: true,
        },
        distinct: ['style'],
        orderBy: {
          style: 'asc',
        },
      }),

      // Get unique models for filter dropdown
      db.emoteForSale.findMany({
        where: {
          status: EmoteStatus.MARKETPLACE_PUBLISHED,
          model: { not: null },
        },
        select: {
          model: true,
        },
        distinct: ['model'],
        orderBy: {
          model: 'asc',
        },
      }),
    ]);

    // Calculate pagination info
    const totalEmotePages = Math.ceil(totalEmotes / ITEMS_PER_PAGE);

    // Process filter options
    const styleOptions = availableStyles
      .map(item => item.style)
      .filter((style): style is string => Boolean(style))
      .sort();
    
    const modelOptions = availableModels
      .map(item => item.model)
      .filter((model): model is string => Boolean(model))
      .sort();

    // Calculate statistics
    const stats = {
      totalEmotes,
      totalPacks: packsData.totalCount,
      newThisWeek: emotesForSale.filter(item => 
        new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      activeFilters: [
        search !== '',
        style !== '',
        model !== '',
        priceRange !== null,
        sortBy !== 'newest',
      ].filter(Boolean).length,
    };



    // Enhanced props for the marketplace component
    const marketplaceProps = {
      initialEmotesForSale: emotesForSale,
      userEmotes,
      emotePacks: packsData.emotePacks,
      userId,
      currentPage: page,
      totalPages: totalEmotePages,
      totalCount: totalEmotes,
      packsCurrentPage: tab === "packs" ? page : 1,
      packsTotalPages: packsData.totalPages,
      packsTotalCount: packsData.totalCount,
      
      // Enhanced filter options
      availableStyles: styleOptions,
      availableModels: modelOptions,
      
      // Current filter state
      initialFilters: {
        search,
        style,
        model,
        priceRange,
        sortBy,
        tab,
      },
      
      // Statistics
      stats,
    };

    return <Marketplace {...marketplaceProps} />;

  } catch (error) {
    console.error('Marketplace page error:', error);
    
    // Return a fallback error component
    return <ErrorFallback />;
  }
};

export default MarketplacePage;