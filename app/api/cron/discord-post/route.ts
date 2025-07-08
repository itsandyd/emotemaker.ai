import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';
import cron from 'node-cron';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Discord webhook URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!;

// Function to fetch recent EmotesForSale
async function getRecentEmotes() {
  const now = new Date();
  const HOURS = 0.5;
  const twentyFourHoursAgo = new Date(now.getTime() - HOURS * 60 * 60 * 1000);

  const emotes = await prisma.emoteForSale.findMany({
    where: {
      createdAt: {
        gte: twentyFourHoursAgo
      },
      status: 'MARKETPLACE_PUBLISHED',
      watermarkedUrl: {
        not: null
      }
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 15
  });

  console.log(`Found ${emotes.length} recent published emotes with watermarks`);
  return emotes;
}

// Function to post emotes to Discord
async function postEmotesToDiscord(emotes: any[]) {
  for (const emote of emotes) {
    const emotePageUrl = `https://emotemaker.ai/emote/${emote.id}`;
    const embed = {
      title: `New Emote: ${emote.prompt}`,
      description: `Created by: ${emote.user?.name || 'Anonymous'}\n\n[Click here to view and download](${emotePageUrl})`,
      fields: [
        { name: 'Price', value: `$${emote.price?.toFixed(2) || 'N/A'}`, inline: true },
        { name: 'Style', value: emote.style || 'N/A', inline: true },
        { name: 'Model', value: emote.model || 'N/A', inline: true }
      ],
      timestamp: emote.createdAt,
      url: emotePageUrl // This makes the title clickable
    };
    
    try {
      // Use watermarkedUrl instead of imageUrl
      const imageResponse = await fetch(emote.watermarkedUrl);
      if (!imageResponse.ok) throw new Error('Failed to fetch watermarked image');
      const imageBuffer = await imageResponse.arrayBuffer();

      // Create form data with file
      const formData = new FormData();
      formData.append('payload_json', JSON.stringify({ embeds: [embed] }));
      formData.append('file', new Blob([imageBuffer]), 'emote_watermarked.png');

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Discord API responded with status: ${response.status}`);
      }
      
      console.log(`Posted watermarked emote: ${emote.prompt}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to post watermarked emote: ${emote.prompt}`, error.message);
      } else {
        console.error(`Failed to post watermarked emote: ${emote.prompt}`, 'An unknown error occurred');
      }
    }
  }
}

// Cron job function
async function cronJob() {
  try {
    const recentEmotes = await getRecentEmotes();
    
    if (recentEmotes.length === 0) {
      console.log('No recent published emotes with watermarks found to post');
      return;
    }
    
    await postEmotesToDiscord(recentEmotes);
    console.log(`${recentEmotes.length} watermarked emotes posted to Discord successfully`);
  } catch (error) {
    console.error('Error in cron job:', error);
  }
}

// Schedule cron job to run every 30 minutes
cron.schedule('*/30 * * * *', cronJob);

export async function GET(req: Request) {
  const headersList = headers();
  const authHeader = headersList.get('Authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await cronJob();
    return NextResponse.json({ message: 'Cron job executed successfully' });
  } catch (error) {
    console.error('Error in cron job execution:', error);
    return NextResponse.json({ error: 'Failed to run cron job' }, { status: 500 });
  }
}