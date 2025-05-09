import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db";
import Marketplace from "./_components/marketplace";
import { redirect } from "next/navigation";
import { getEmotesForSale } from "@/actions/get-emotes-for-sale";
import { Metadata } from "next";
import { EmoteStatus } from "@prisma/client";
import { getEmotePacks, GetEmotePacksResult } from "@/actions/get-emote-packs";

export const metadata: Metadata = {
  title: "TwitchEmotes.ai - Marketplace",
  description: "Browse and purchase unique emotes created by our community.",
};

const MarketplacePage = async ({ 
  searchParams 
}: { 
  searchParams: { 
    page?: string, 
    search?: string,
    style?: string,
    view?: string
  } 
}) => {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';
  const style = searchParams.style || '';
  const view = searchParams.view || 'emotes';
  const ITEMS_PER_PAGE = 12;

  const skip = (page - 1) * ITEMS_PER_PAGE;

  const emoteWhere: any = {
    status: EmoteStatus.MARKETPLACE_PUBLISHED,
  };

  if (search) {
    emoteWhere.prompt = {
      contains: search,
    };
  }

  if (style) {
    emoteWhere.style = style;
  }

  const [emotesForSale, totalEmotes, userEmotes] = await Promise.all([
    db.emoteForSale.findMany({
      where: emoteWhere,
      include: {
        emote: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    db.emoteForSale.count({
      where: emoteWhere,
    }),
    db.emote.findMany({
      where: {
        userId,
      },
      include: {
        emoteForSale: true,
      },
    }),
  ]);

  const totalEmotePages = Math.ceil(totalEmotes / ITEMS_PER_PAGE);

  let packsData: GetEmotePacksResult = {
    emotePacks: [],
    totalPages: 1,
    currentPage: 1,
    totalCount: 0,
  };

  if (view === "packs") {
    packsData = await getEmotePacks({
      userId: "",
      page,
      itemsPerPage: ITEMS_PER_PAGE,
    });
  } else {
    packsData = await getEmotePacks({
      userId: "",
      page: 1,
      itemsPerPage: 6,
    });
  }

  return (
    <Marketplace 
      initialEmotesForSale={emotesForSale}
      userEmotes={userEmotes}
      emotePacks={packsData.emotePacks}
      userId={userId}
      currentPage={page}
      totalPages={totalEmotePages}
      totalCount={totalEmotes}
      packsCurrentPage={view === "packs" ? page : 1}
      packsTotalPages={packsData.totalPages}
      packsTotalCount={packsData.totalCount}
    />
  )
}

export default MarketplacePage