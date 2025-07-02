import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { emoteId } = req.body;

  // Verify the webhook secret if necessary

  try {
    // Trigger the Instagram posting
    await fetch('/api/instagram/post-emote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoteId }),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling new emote webhook:', error);
    res.status(500).json({ error: 'Failed to process new emote' });
  }
}
