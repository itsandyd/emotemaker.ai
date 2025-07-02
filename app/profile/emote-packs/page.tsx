import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ListEmotePack from "../_components/list-emote-pack";
import { getEmotePacks } from "@/actions/get-emote-packs";

interface EmotePacksPageProps {
  searchParams: {
    page?: string;
  };
}

const ITEMS_PER_PAGE = 9;

const EmotePacksPage = async ({ searchParams }: EmotePacksPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/signin');
  }

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;

  try {
    // Use the server action to fetch emote packs
    const { emotePacks, totalPages } = await getEmotePacks({
      userId,
      page: currentPage,
      itemsPerPage: ITEMS_PER_PAGE
    });
    
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Emote Packs</h1>
        <p className="text-muted-foreground mb-6">
          Create and manage your emote packs to sell multiple emotes together.
        </p>
        <ListEmotePack 
          emotePacks={emotePacks} 
          totalPages={totalPages} 
          currentPage={currentPage} 
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading emote packs:", error);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Emote Packs</h1>
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          Error loading your emote packs. Please try again later.
        </div>
      </div>
    );
  }
};

export default EmotePacksPage; 