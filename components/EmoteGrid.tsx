import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmoteForSale, Emote } from "@prisma/client";
import { EmoteCard } from "@/components/emotes/EmoteCard";

interface EmoteGridProps {
  emotes: (EmoteForSale & { emote: Emote })[];
  loading: boolean;
}

const EmoteGrid = ({ emotes, loading }: EmoteGridProps) => {
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {[...Array(10)].map((_, index) => (
        <Card key={index} className="group">
          <div className="p-4">
            <Skeleton className="aspect-square w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="p-4 pt-0">
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (emotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-xl font-medium mb-2">No emotes found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {emotes.map((emoteForSale) => (
        <EmoteCard
          key={emoteForSale.id}
          id={emoteForSale.emoteId}
          imageUrl={emoteForSale.watermarkedUrl || emoteForSale.imageUrl || ''}
          prompt={emoteForSale.prompt}
        />
      ))}
    </div>
  );
};

export default EmoteGrid; 