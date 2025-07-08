"use client"

import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmotePreview from "../../_components/EmotePreview";
import { EmoteForSale, Emote } from "@prisma/client";

type EmoteForSaleWithDetails = EmoteForSale & {
  emote: Emote;
  user?: {
    id: string;
    name: string | null;
  } | null;
};

const EmotePage = () => {
  const { userId } = useAuth();
  const params = useParams();
  const [emote, setEmote] = useState<EmoteForSaleWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchEmote = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/emotes/${params.id}/for-sale`);
        
        if (!response.ok) {
          throw new Error('Emote not found');
        }
        
        const data = await response.json();
        setEmote(data.emote);
      } catch (error) {
        console.error('Failed to fetch emote:', error);
        setError('Failed to load emote');
      } finally {
        setLoading(false);
      }
    };

    fetchEmote();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="aspect-square bg-gray-200 rounded-xl mb-6"></div>
              <div className="bg-gray-200 rounded-xl h-48"></div>
            </div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !emote) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Emote not found</h3>
          <p className="text-muted mb-4">The emote you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/marketplace">
            <Button>Return to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/marketplace" className="inline-flex items-center text-muted hover:text-primary mb-6 transition">
        <ChevronLeft className="mr-1" size={16} />
        Back to Marketplace
      </Link>

      <EmotePreview emote={emote} />
    </div>
  );
};

export default EmotePage; 