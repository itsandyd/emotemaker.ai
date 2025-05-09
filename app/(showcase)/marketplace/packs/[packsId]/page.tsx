import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

import { getPackById } from "@/actions/get-pack-by-id";
import EmotePackPreview from "../../_components/EmotePackPreview";

interface PackPageProps {
  params: {
    packsId: string;
  };
}

const PackPage = async ({ params }: PackPageProps) => {
  const data = await getPackById({ packId: params.packsId });

  if (!data || !data.pack) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Emote pack not found</h3>
          <p className="text-muted mb-4">The emote pack you're looking for doesn't exist or has been removed.</p>
          <Link href="/marketplace">
            <Button>Return to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { pack, emotes } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/marketplace" className="inline-flex items-center text-muted hover:text-primary mb-6 transition">
        <ChevronLeft className="mr-1" size={16} />
        Back to Marketplace
      </Link>

      <EmotePackPreview pack={pack} emotes={emotes} />
    </div>
  );
};

export default PackPage;
