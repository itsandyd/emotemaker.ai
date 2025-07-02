import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import InstagramApi from 'instagram-web-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { emoteId } = req.body;

  const emote = await db.emote.findUnique({
    where: { id: emoteId },
  });

  if (!emote || emote.postedToInstagram) {
    return res.status(400).json({ error: 'Invalid emote or already posted' });
  }

  const client = new InstagramApi({
    username: process.env.INSTAGRAM_USERNAME!,
    password: process.env.INSTAGRAM_PASSWORD!,
  });

  try {
    await client.login();
    await client.uploadPhoto({
      photo: emote.imageUrl!,
      caption: emote.prompt || 'New emote generated!',
      post: 'feed',
    });

    await db.emote.update({
      where: { id: emoteId },
      data: { postedToInstagram: true },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error posting to Instagram:', error);
    res.status(500).json({ error: 'Failed to post to Instagram' });
  }
}
