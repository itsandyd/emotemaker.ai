'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EmojiSvg from "@/app/components/EmojiSvg";
import toast from "react-hot-toast";
import axios from "axios";
import { addEmoteToLibrary } from "@/actions/addEmoteToLibrary";

// Type definitions based on Prisma schema
interface Emote {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string;
  price: number;
  style: string | null;
  model: string | null;
  createdAt: Date | null;
  type: string;
  tags: string[];
  createdWith: string;
  creator: string;
  emoteForSaleId: string | null;
  watermarkedUrl: string | null;
}

interface SimilarEmote {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  style: string | null;
  emoteForSaleId: string | null;
}

interface EmoteDetailProps {
  emote: Emote;
  similarEmotes: SimilarEmote[];
}

const EmoteSize = ({ 
  size, 
  label, 
  imageUrl 
}: { 
  size: string; 
  label: string; 
  imageUrl: string | null;
}) => {
  // Calculate numeric size for image dimensions
  const sizeValue = size === "Full" ? 516 : parseInt(size);
  const displaySize = !isNaN(sizeValue) ? sizeValue : 128;
  
  // Use responsive sizing for the full size emote
  const isFullSize = displaySize > 400;
  
  // Use fixed sizes for different emote sizes
  const containerClasses = isFullSize
    ? "flex justify-center items-center p-4 min-h-[540px] relative" // Larger container for full size
    : displaySize > 100 
      ? "h-32 p-2"
      : displaySize > 80 
        ? "h-28 p-2" 
        : displaySize > 50 
          ? "h-20 p-2" 
          : "h-16 p-2";
  
  return (
    <div className={`flex flex-col items-center bg-gray-100 p-3 rounded`}>
      <div className={`relative border border-gray-300 rounded mb-2 flex items-center justify-center overflow-hidden w-full ${containerClasses}`}>
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={`${label} size preview`}
              width={displaySize}
              height={displaySize}
              className="object-contain"
              priority={isFullSize}
              style={{
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-white bg-black/70 px-2 py-1 rounded">
              {displaySize}px
            </div>
          </>
        ) : (
          <span className="text-xs text-gray-600">{size}</span>
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 mt-1">{label}</span>
    </div>
  );
};

const SimilarEmotes = ({ emotes }: { emotes: SimilarEmote[] }) => (
  <div className="mt-8">
    <h2 className="text-lg font-medium mb-4">Similar Emotes</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {emotes.map((emote) => (
        <Link 
          key={emote.id} 
          href={`/emote/${emote.emoteForSaleId || emote.id}`}
          className="bg-dark-lighter rounded-lg overflow-hidden transition hover:scale-105"
        >
          <div className="h-24 flex items-center justify-center bg-dark-light p-2">
            <Image
              src={emote.imageUrl || '/placeholder-emote.png'}
              alt={emote.name}
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <div className="p-2">
            <h3 className="text-xs font-medium truncate">{emote.name}</h3>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted">{emote.style}</span>
              <span className="text-xs font-medium">${emote.price.toFixed(2)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const EmoteDetail = ({ emote, similarEmotes }: EmoteDetailProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Handle URL params for purchase status
  useEffect(() => {
    // Check URL for purchase status
    const url = new URL(window.location.href);
    const purchasedParam = url.searchParams.get('purchased');
    const canceledParam = url.searchParams.get('canceled');

    if (purchasedParam === 'true') {
      toast.success('Purchase completed successfully! Emote added to your library.');
      // Remove the parameter from URL
      url.searchParams.delete('purchased');
      window.history.replaceState({}, '', url.toString());
    } else if (canceledParam === 'true') {
      toast.error('Purchase was canceled.');
      // Remove the parameter from URL
      url.searchParams.delete('canceled');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      
      if (emote.price > 0) {
        // For paid emotes, use Stripe checkout
        const emoteForSaleId = emote.emoteForSaleId;
        if (!emoteForSaleId) {
          toast.error("This emote is not available for purchase");
          return;
        }
        
        const response = await axios.get(`/api/stripe/purchase-emote?emoteId=${emoteForSaleId}`);
        window.location.href = response.data.url;
      } else {
        // For free emotes, use addEmoteToLibrary
        const result = await addEmoteToLibrary({
          prompt: emote.name,
          imageUrl: emote.imageUrl || '',
          style: emote.style || '',
          isVideo: emote.type === "animated"
        });
        
        if (result.success) {
          toast.success('Emote added to your library');
          router.push('/profile'); // Redirect to profile after adding
        } else {
          throw new Error(result.error);
        }
      }
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
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which image to display - always prefer watermarked for marketplace display
  const displayImageUrl = emote.watermarkedUrl || emote.imageUrl;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/marketplace" className="inline-flex items-center text-gray-600 hover:text-primary mb-6 transition">
        <ChevronLeft className="mr-1" size={16} />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="md:sticky md:top-24 w-full">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 flex items-center justify-center relative h-[550px]">
            {displayImageUrl ? (
              <>
                <Image
                  src={displayImageUrl}
                  alt={emote.name}
                  width={516}
                  height={516}
                  priority
                  className="max-w-full max-h-[500px] object-contain"
                />
                <div className="absolute bottom-2 right-2 text-xs text-white bg-black/70 px-2 py-1 rounded">
                  516px × 516px
                </div>
              </>
            ) : (
              <EmojiSvg 
                className="max-w-full max-h-[500px] object-contain"
                type={emote.style}
              />
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold mb-2">{emote.name}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {emote.tags.map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="outline"
                className="text-xs px-2 py-1 bg-gray-100 border-gray-300 text-gray-700 rounded-full"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-6">{emote.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-1">Created with</h3>
                <p className="text-gray-700">{emote.createdWith}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-1">Artist</h3>
                <p className="text-gray-700">{emote.creator}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-1">Format</h3>
                <p className="text-gray-700">{emote.type === "animated" ? "Animated GIF" : "Static PNG"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-1">Created on</h3>
                <p className="text-gray-700">{new Date(emote.createdAt as Date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 py-4 border-y border-gray-200">
            <div>
              <span className="text-sm text-gray-600">Price</span>
              <p className="text-2xl font-semibold text-blue-600">${emote.price.toFixed(2)}</p>
            </div>
            <Button 
              onClick={handlePurchase}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white transition px-8 py-3 rounded-lg font-medium"
            >
              {isLoading ? 'Processing...' : emote.price > 0 ? 'Purchase Emote' : 'Add to Library'}
            </Button>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-800 mb-4">Preview All Sizes</h3>
            <div className="flex flex-col space-y-8">
              <div>
                <h4 className="text-xs font-medium mb-3 text-gray-600">Platform-Specific Sizes</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <EmoteSize size="128px" label="Discord" imageUrl={displayImageUrl} />
                  <EmoteSize size="112px" label="Twitch Large" imageUrl={displayImageUrl} />
                  <EmoteSize size="56px" label="Twitch Medium" imageUrl={displayImageUrl} />
                  <EmoteSize size="28px" label="Twitch Small" imageUrl={displayImageUrl} />
                </div>
              </div>
            </div>
          </div>

          {similarEmotes && similarEmotes.length > 0 && (
            <SimilarEmotes emotes={similarEmotes} />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmoteDetail; 