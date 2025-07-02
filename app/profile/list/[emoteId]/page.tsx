"use client"

import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import ListEmote from "../../_components/list-emote";
import { Emote } from "@prisma/client";
import { useParams } from 'next/navigation';

const ListEmotePage = () => {
  const { userId } = useAuth();
  const params = useParams();
  const [emote, setEmote] = useState<Emote | null>(null);

  useEffect(() => {
    if (!userId || !params.emoteId) return;

    const fetchEmote = async () => {
      try {
        const response = await fetch(`/api/emotes/${params.emoteId}?userId=${userId}`);
        const data = await response.json();
        setEmote(data.emote);
      } catch (error) {
        console.error('Failed to fetch emote:', error);
      }
    };

    fetchEmote();
  }, [userId, params.emoteId]);

  if (!userId) {
    return <div>Please sign in to list emotes.</div>;
  }

  if (!emote) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">List Your Emote</h1>
      <ListEmote
        emotes={[emote]}
        totalPages={1}
        currentPage={1}
        onPageChange={() => {}}
      />
    </div>
  );
}

export default ListEmotePage;
