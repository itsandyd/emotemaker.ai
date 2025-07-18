"use client";

import { EmoteForSale } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import EmoteCard from "./EmoteCard";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

interface EmoteGridProps {
  emotes: EmoteForSale[];
  loading?: boolean;
  onPurchase?: (emoteId: string) => void;
}

const EmoteGrid = ({ emotes, loading = false, onPurchase }: EmoteGridProps) => {
  const router = useRouter();
  const user = useUser();
  console.log(`Rendering EmoteGrid with ${emotes?.length || 0} emotes`);

  const handlePurchase = async (emoteId: string) => {
    try {
      const response = await axios.get(`/api/stripe/purchase-emote?emoteId=${emoteId}`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Purchase error:', error);
      if (axios.isAxiosError(error)) {
        // Check for the specific Stripe Connect capabilities error
        const errorMessage = error.response?.data?.error || error.message;
        if (errorMessage.includes('capabilities') || errorMessage.includes('Connect')) {
          toast.error("We're having issues processing payments for this creator. Please try again later while we fix this!");
        } else {
          toast.error(`Failed to complete purchase: ${errorMessage}`);
        }
      } else if (error instanceof Error) {
        toast.error(`Failed to complete purchase: ${error.message}`);
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="bg-dark-lighter rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-center bg-dark-light h-40 animate-pulse">
              <div className="h-32 w-32 bg-dark-light rounded-md"></div>
            </div>
            <div className="p-3">
              <div className="h-4 bg-dark-light rounded animate-pulse mb-2"></div>
              <div className="flex justify-between items-center mb-3">
                <div className="h-4 w-16 bg-dark-light rounded animate-pulse"></div>
                <div className="h-4 w-10 bg-dark-light rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-dark-light rounded animate-pulse"></div>
                <div className="h-8 bg-dark-light rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!emotes || emotes.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-dark-lighter rounded-xl p-8 max-w-md mx-auto">
          <h3 className="text-xl font-medium mb-2">No emotes found</h3>
          <p className="text-muted mb-6">No emotes are currently available in the marketplace. Be the first to add one!</p>
          <Link href="/profile/list">
            <Button className="flex items-center mx-auto">
              <PlusIcon className="mr-2 h-4 w-4" /> Create Emote
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {emotes.map((emoteForSale) => {
        // Since we don't have the emotePackItems relation loaded, 
        // we'll need to use a prop or other indicator passed from the parent component
        const isInPack = false; // Set false as default
        
        return (
          <EmoteCard 
            key={emoteForSale.id} 
            emote={{
              id: emoteForSale.id,
              imageUrl: emoteForSale.watermarkedUrl || emoteForSale.imageUrl,
              prompt: emoteForSale.prompt,
              style: emoteForSale.style,
              model: emoteForSale.model,
              createdAt: emoteForSale.createdAt,
              userId: emoteForSale.userId,
              // Add necessary properties for Emote
              videoUrl: null,
              originalCreatorId: null,
              isVideo: false,
              postedToInstagram: false,
              // Add name and price properties from EmoteForSale
              name: emoteForSale.prompt,
              price: emoteForSale.price || 0
            }}
            isPack={isInPack}
            onPurchase={onPurchase || handlePurchase}
          />
        );
      })}
    </div>
  );
};

export default EmoteGrid;
