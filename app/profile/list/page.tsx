"use client"

import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import ListEmote from "../_components/list-emote";
import { Emote } from "@prisma/client";
import { getEmotes } from "@/actions/get-emotes";

const ITEMS_PER_PAGE = 10;

const MarketplacePage = () => {
  const { userId } = useAuth();
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!userId) return;

    const fetchEmotes = async () => {
      try {
        const response = await fetch(`/api/emotes?page=${currentPage}&limit=${ITEMS_PER_PAGE}&userId=${userId}`);
        const data = await response.json();
        setEmotes(data.emotes);
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Failed to fetch emotes:', error);
      }
    };

    fetchEmotes();
  }, [userId, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (!userId) {
    return <div>Please sign in to list emotes.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold my-4">List Your Emotes</h1>
      <ListEmote
        emotes={emotes}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default MarketplacePage;
