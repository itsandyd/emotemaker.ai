"use client"

import { EmoteForSale, Emote } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmotePackWithItems } from "@/actions/get-emote-packs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PlusIcon, Package, ShoppingCart, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PackPurchaseModal from "./pack-purchase-modal";

interface EmotePacksGridProps {
  emotePacks: EmotePackWithItems[];
  loading?: boolean;
}

const PackCard = ({ pack }: { pack: EmotePackWithItems }) => {
  // Get preview emotes (first 4 emotes in the pack)
  const previewEmotes = pack.emotePackItems.slice(0, 4);
  const totalEmotes = pack.emotePackItems.length;
  
  // Calculate savings if individual prices are available
  const totalIndividualPrice = pack.emotePackItems.reduce((sum, item) => {
    return sum + (item.emoteForSale.price || 0);
  }, 0);
  const savings = totalIndividualPrice > pack.price ? totalIndividualPrice - pack.price : 0;
  const savingsPercentage = totalIndividualPrice > 0 ? Math.round((savings / totalIndividualPrice) * 100) : 0;

  // Create a simplified pack object for the modal with type assertions
  const packForModal = {
    id: pack.id,
    name: pack.name,
    description: pack.description || "",
    price: pack.price,
    imageUrl: pack.imageUrl || undefined,
    watermarkedUrl: pack.watermarkedUrl || undefined,
    createdAt: pack.createdAt.toISOString(),
    userId: pack.userId || "",
    emotePackItems: pack.emotePackItems.map(item => ({
      id: item.id,
      emoteForSale: {
        id: item.emoteForSale.id,
        imageUrl: item.emoteForSale.imageUrl,
        watermarkedUrl: item.emoteForSale.watermarkedUrl || undefined,
        prompt: item.emoteForSale.prompt,
        style: item.emoteForSale.style,
        model: item.emoteForSale.model,
        price: item.emoteForSale.price || 0
      }
    }))
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-0">
        {/* Pack Cover/Preview */}
        <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
          {pack.imageUrl || pack.watermarkedUrl ? (
            <Image
              src={pack.watermarkedUrl || pack.imageUrl || ''}
              alt={pack.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : previewEmotes.length > 0 ? (
            <div className="grid grid-cols-2 gap-0.5 h-full">
              {previewEmotes.map((item, index) => (
                <div key={item.id} className="relative bg-gray-50">
                  <Image
                    src={item.emoteForSale.watermarkedUrl || item.emoteForSale.imageUrl}
                    alt={item.emoteForSale.prompt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {/* Fill remaining grid spots if less than 4 emotes */}
              {Array.from({ length: 4 - previewEmotes.length }).map((_, index) => (
                <div key={`empty-${index}`} className="bg-gray-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Quick Preview Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Eye className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Savings Badge */}
          {savings > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 text-white">
                Save {savingsPercentage}%
              </Badge>
            </div>
          )}
        </div>

        {/* Pack Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1">
              {pack.name}
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {pack.description || "A collection of unique emotes"}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="h-4 w-4" />
              <span>{totalEmotes} emote{totalEmotes !== 1 ? 's' : ''}</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                ${pack.price.toFixed(2)}
              </div>
              {savings > 0 && (
                <div className="text-xs text-gray-500 line-through">
                  ${totalIndividualPrice.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <PackPurchaseModal
              pack={packForModal as any}
              trigger={
                <Button className="w-full" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase Pack
                </Button>
              }
            />
            
            <Link href={`/marketplace/packs/${pack.id}`} className="block">
              <Button variant="outline" className="w-full" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EmotePacksGrid({ emotePacks, loading = false }: EmotePacksGridProps) {
  console.log(`Rendering EmotePacksGrid with ${emotePacks?.length || 0} packs`);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!emotePacks || emotePacks.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No emote packs found</h3>
          <p className="text-gray-600 mb-6">
            There are currently no emote packs available in the marketplace.
          </p>
          <Link href="/profile/emote-packs">
            <Button className="flex items-center mx-auto">
              <PlusIcon className="mr-2 h-4 w-4" /> 
              Create Your First Pack
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {emotePacks.map((pack) => (
        <PackCard key={pack.id} pack={pack} />
      ))}
    </div>
  );
} 