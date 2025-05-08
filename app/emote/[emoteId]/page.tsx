import { EmoteForSale, Emote } from '@prisma/client';
import { db } from '@/lib/db';
import Image from 'next/image';
import { getEmoteById } from '@/actions/get-emote-by-id';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import EmoteProduct from '../_components/EmoteProduct';
import { addEmoteToLibrary } from "@/actions/addEmoteToLibrary";
import { Metadata, ResolvingMetadata } from 'next';
import EmoteClientWrapper from '../_components/EmoteClientWrapper';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import the client component with client-side only execution
import EmoteDetail from './page-client';

type Props = {
  params: { emoteId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const emoteListing = await db.emoteForSale.findUnique({
    where: {
      id: params.emoteId,
    },
    include: {
      emote: true,
    },
  });

  if (!emoteListing) {
    return {
      title: 'Emote Not Found | EmoteMaker.ai',
      description: 'The requested emote could not be found on EmoteMaker.ai.',
    };
  }

  const prompt = emoteListing.prompt ?? 'Untitled';
  const style = emoteListing.emote.style ?? 'Standard';
  const model = emoteListing.emote.model ?? 'AI Model';

  // Create more detailed and keyword-rich title/description
  const title = `${prompt} ${style} Emote | Premium Twitch & Discord Emote | EmoteMaker.ai`;
  const description = `Get this premium ${style} style ${prompt} emote created with ${model}. Perfect for Twitch, Discord, and other streaming platforms. Download instantly after purchase.`;
  
  const imageUrl = emoteListing.watermarkedUrl ?? emoteListing.imageUrl ?? '';
  const absoluteImageUrl = new URL(imageUrl, 'https://emotemaker.ai').toString();

  return {
    title,
    description,
    keywords: [
      prompt, 
      style, 
      'emote', 
      'twitch emote', 
      'discord emote', 
      'custom emote', 
      'streaming emote',
      'EmoteMaker.ai'
    ].filter(Boolean),
    authors: [{ name: 'EmoteMaker.ai' }],
    creator: 'EmoteMaker.ai',
    publisher: 'EmoteMaker.ai',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://emotemaker.ai/emote/${params.emoteId}`,
      siteName: 'EmoteMaker.ai',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 1200,
          alt: `${prompt} ${style} emote for Twitch and Discord`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImageUrl],
      creator: '@EmoteMaker_AI',
      site: '@EmoteMaker_AI',
    },
    other: {
      'og:image': absoluteImageUrl,
      'og:image:secure_url': absoluteImageUrl,
      'og:image:width': '1200',
      'og:image:height': '1200',
      'og:image:alt': `${prompt} ${style} emote for Twitch and Discord`,
      'og:type': 'website',
      'og:url': `https://emotemaker.ai/emote/${params.emoteId}`,
    },
  };
}

export default async function EmoteIdPage({ params }: { params: { emoteId: string } }) {
  const emoteId = params.emoteId;
  let emote: (Emote & { emoteForSale: EmoteForSale | null }) | null = null;
  let emoteListing: (EmoteForSale & { emote: Emote }) | null = null;

  // First, try to find the Emote
  emote = await db.emote.findUnique({
    where: { id: emoteId },
    include: { emoteForSale: true },
  });

  // If not found, try to find the EmoteForSale
  if (!emote) {
    emoteListing = await db.emoteForSale.findUnique({
      where: { id: emoteId },
      include: { emote: true },
    });

    if (emoteListing) {
      emote = { ...emoteListing.emote, emoteForSale: emoteListing };
    }
  }

  if (!emote) {
    notFound();
  }

  // Get price from emoteForSale if available
  const price = emote.emoteForSale?.price || 0;
  const prompt = emote.prompt || emote.emoteForSale?.prompt || 'Untitled';
  
  // Prioritize watermarked image if available
  const imageUrl = emote.emoteForSale?.watermarkedUrl || emote.emoteForSale?.imageUrl || emote.imageUrl || null;
  
  // Transform emote data to match the expected format for the client
  const formattedEmote = {
    id: emote.id,
    name: prompt,
    imageUrl: imageUrl,
    description: `This premium ${emote.style || 'custom'} style emote is perfect for Twitch, Discord, and other streaming platforms. It's ready to use immediately after purchase.`,
    price: price,
    style: emote.style,
    model: emote.model,
    createdAt: emote.createdAt,
    type: emote.isVideo ? "animated" : "static",
    tags: emote.style ? [emote.style, prompt.split(' ')[0], "premium"] : [prompt.split(' ')[0], "premium"],
    createdWith: emote.model || "AI Technology",
    creator: "EmoteMaker.ai Design Team",
    emoteForSaleId: emote.emoteForSale?.id || null,
    watermarkedUrl: emote.emoteForSale?.watermarkedUrl || null
  };

  // Fetch similar emotes
  const similarEmotes = await db.emote.findMany({
    where: {
      style: emote.style,
      id: { not: emote.id }
    },
    take: 4,
    include: {
      emoteForSale: true
    }
  });

  const formattedSimilarEmotes = similarEmotes.map(similar => ({
    id: similar.id,
    name: similar.prompt || 'Similar Emote',
    // Prioritize watermarked images for similar emotes too
    imageUrl: similar.emoteForSale?.watermarkedUrl || similar.emoteForSale?.imageUrl || similar.imageUrl,
    price: similar.emoteForSale?.price || 0,
    style: similar.style,
    emoteForSaleId: similar.emoteForSale?.id || null
  }));

  // Render the client-side component with server-fetched data
  return <EmoteDetail emote={formattedEmote} similarEmotes={formattedSimilarEmotes} />;
}
