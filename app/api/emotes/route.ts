import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const skip = (page - 1) * limit;

  try {
    const [emotes, total] = await Promise.all([
      db.emote.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.emote.count({ where: { userId: userId } }),
    ]);

    return NextResponse.json({
      emotes,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch emotes:', error);
    return NextResponse.json({ error: 'Failed to fetch emotes' }, { status: 500 });
  }
}
