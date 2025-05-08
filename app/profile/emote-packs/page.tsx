import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ListEmotePack from "../_components/list-emote-pack";

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
    // Check if the database and model are properly initialized
    if (!db || !db.emotePack) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">Emote Packs</h1>
          <p className="text-red-500 mt-2">
            Database schema is not properly initialized. Please run prisma db push to fix this issue.
          </p>
        </div>
      );
    }
    
    // Get total count for pagination
    const totalCount = await db.emotePack.count({
      where: { userId },
    });

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    
    // Get emote packs for current page
    const emotePacks = await db.emotePack.findMany({
      where: { userId },
      include: {
        emotePackItems: {
          include: {
            emoteForSale: {
              include: {
                emote: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    });

    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Emote Packs</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your emote packs to sell in the marketplace
          </p>
        </div>
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
        <p className="text-red-500 mt-2">
          An error occurred while loading your emote packs. Please try again later.
        </p>
      </div>
    );
  }
};

export default EmotePacksPage; 