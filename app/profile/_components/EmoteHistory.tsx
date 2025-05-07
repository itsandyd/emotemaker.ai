"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Emote, EmoteForSale } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmoteCard } from "@/components/emotes/EmoteCard";

interface EmoteHistoryProps {
  emotes: (Emote & { emoteForSale: EmoteForSale | null })[];
  userId: string;
  isPremiumUser?: boolean;
}

const ITEMS_PER_PAGE = 8;

export const EmoteHistoryCard = ({ emotes, userId, isPremiumUser = false }: EmoteHistoryProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredEmotes = emotes.filter(emote => 
    emote.prompt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmotes.length / ITEMS_PER_PAGE);
  const paginatedEmotes = filteredEmotes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
        <Skeleton key={index} className="w-full aspect-square" />
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emote History</CardTitle>
        <CardDescription>View and download your generated emotes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Input 
          placeholder="Search emotes..." 
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4"
        />
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {paginatedEmotes.map((emote) => (
              <EmoteCard
                key={emote.id}
                id={emote.id}
                imageUrl={emote.imageUrl || "/placeholder.svg"}
                prompt={emote.prompt}
                isPremiumUser={isPremiumUser}
                isVideo={emote.isVideo || false}
                isGif={(emote.imageUrl?.toLowerCase().endsWith('.gif') || false) && !(emote.isVideo || false)}
              />
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {currentPage} / {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};