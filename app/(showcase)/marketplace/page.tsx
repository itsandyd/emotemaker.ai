import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db";
import Marketplace from "./_components/marketplace";
import { redirect } from "next/navigation";
import { getEmotesForSale } from "@/actions/get-emotes-for-sale";

const MarketplacePage = async ({ 
  searchParams 
}: { 
  searchParams: { 
    page?: string, 
    search?: string,
    style?: string 
  } 
}) => {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';
  const style = searchParams.style || '';
  const ITEMS_PER_PAGE = 20;

  const { emotesForSale, totalCount } = await getEmotesForSale({
    page,
    itemsPerPage: ITEMS_PER_PAGE,
    search,
    style
  });

  const userEmotes = await db.emote.findMany({
    where: {
      userId: userId,
    },
    include: {
      emoteForSale: true,
    },
    orderBy: {
      createdAt: "desc",
    }
  });

  return (
    <Marketplace 
      initialEmotesForSale={emotesForSale}
      userEmotes={userEmotes}
      userId={userId}
      currentPage={page}
      totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
      totalCount={totalCount}
    />
  )
}

export default MarketplacePage