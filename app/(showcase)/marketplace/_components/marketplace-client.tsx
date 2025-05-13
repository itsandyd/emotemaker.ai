"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { EmoteForSale, Emote } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { EmotePackWithItems } from "@/actions/get-emote-packs";
import { useUser } from "@clerk/nextjs";

// Import our new components
import EmoteFilter from "@/components/EmoteFilter";
import EmoteSearchBar from "@/components/EmoteSearchBar";
import EmotePagination from "@/components/EmotePagination";
import EmoteGrid from "./EmoteGrid";
import EmotePacksGrid from "./EmotePacksGrid";

interface MarketplaceClientProps {
  initialEmotesForSale: (EmoteForSale & { emote: Emote })[];
  userEmotes: (Emote & { emoteForSale: EmoteForSale | null })[];
  emotePacks: EmotePackWithItems[];
  userId: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  packsCurrentPage: number;
  packsTotalPages: number;
  packsTotalCount: number;
}

export default function MarketplaceClient({ 
  initialEmotesForSale, 
  userEmotes, 
  emotePacks = [],
  userId, 
  currentPage, 
  totalPages, 
  totalCount,
  packsCurrentPage,
  packsTotalPages,
  packsTotalCount
}: MarketplaceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emotes, setEmotes] = useState(initialEmotesForSale);
  const [loading, setLoading] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<string>(searchParams.get('style') || "");
  const [viewMode, setViewMode] = useState<"emotes" | "packs">(
    searchParams.get('view') === "packs" ? "packs" : "emotes"
  );
  const { toast } = useToast();
  const { user } = useUser();

  // Reset loading state when initialEmotesForSale changes
  useEffect(() => {
    setEmotes(initialEmotesForSale);
    setLoading(false);
  }, [initialEmotesForSale]);

  // Prepare extra URL params for pagination links
  const getExtraParams = () => {
    const params = [];
    const search = searchParams.get('search');
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (currentStyle) params.push(`style=${encodeURIComponent(currentStyle)}`);
    return params.length ? params.join('&') : '';
  };

  const handlePurchase = async (emoteId: string) => {
    try {
      const response = await axios.get(`/api/stripe/purchase-emote?emoteId=${emoteId}`);
      const { url } = response.data;
      window.location.href = url;
    } catch (error) {
      console.error('Error initiating purchase:', error);
      if (axios.isAxiosError(error)) {
        // Check for the specific Stripe Connect capabilities error
        const errorMessage = error.response?.data?.error || error.message;
        if (errorMessage.includes('capabilities') || errorMessage.includes('Connect')) {
          toast({
            title: "Payment Issue",
            description: "We're having issues processing payments for this creator. Please try again later while we fix this!",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to complete purchase: ${errorMessage}`,
            variant: "destructive",
          });
        }
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: `Failed to complete purchase: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: 'An unknown error occurred',
          variant: "destructive",
        });
      }
    }
  };

  // Toggle view mode and update URL
  const toggleViewMode = (mode: "emotes" | "packs") => {
    setViewMode(mode);
    
    // Update URL to preserve view mode during navigation
    const newParams = new URLSearchParams(searchParams.toString());
    if (mode === "packs") {
      newParams.set("view", "packs");
    } else {
      newParams.delete("view");
    }
    
    // Go to page 1 when switching view
    newParams.set("page", "1");
    
    router.push(`/marketplace?${newParams.toString()}`);
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Emote Marketplace</h1>
            <p className="text-muted-foreground">Browse and purchase unique emotes created by our community.</p>
          </div>
          <div className="flex flex-col sm:flex-row mt-4 md:mt-0 space-y-3 sm:space-y-0 sm:space-x-3">
            <EmoteSearchBar initialValue={searchParams.get('search') || ""} />
            <Link href="/profile/list">
              <Button className="flex items-center">
                <PlusIcon className="mr-2 h-4 w-4" /> Add Emote
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <EmoteFilter onFilterChange={setCurrentStyle} />
          
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "emotes" ? "default" : "outline"} 
              onClick={() => toggleViewMode("emotes")}
            >
              Individual Emotes
            </Button>
            <Button 
              variant={viewMode === "packs" ? "default" : "outline"} 
              onClick={() => toggleViewMode("packs")}
            >
              Emote Packs
            </Button>
          </div>
        </div>

        {viewMode === "emotes" ? (
          <>
            <EmoteGrid 
              emotes={emotes} 
              loading={loading} 
              onPurchase={handlePurchase}
            />
            
            {totalPages > 1 && (
              <EmotePagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                baseUrl="/marketplace" 
                extraParams={getExtraParams()}
              />
            )}
          </>
        ) : (
          <>
            <EmotePacksGrid emotePacks={emotePacks} />
            
            {packsTotalPages > 1 && (
              <EmotePagination 
                currentPage={packsCurrentPage} 
                totalPages={packsTotalPages} 
                baseUrl="/marketplace" 
                extraParams={`view=packs&${getExtraParams()}`}
              />
            )}
          </>
        )}
      </div>
  );
} 