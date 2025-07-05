import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://emotemaker.ai'

  // Fetch all emote IDs
  const emotes = await db.emoteForSale.findMany({
    select: { id: true, updatedAt: true },
  })

  const emoteUrls = emotes.map((emote) => ({
    url: `${baseUrl}/emote/${emote.id}`,
    lastModified: emote.updatedAt,
  }))

  // Static pages that should be indexed
  const staticPages = [
    '',
    '/marketplace',
    '/dashboard',
    '/pricing',
    '/credits',
    '/models',
    '/chibi',
    '/kawaii',
    '/pepe',
    '/pixel',
    '/ghibli',
    '/3d',
    '/cuteboldlines',
    '/sell-with-us',
    '/tools/remove-background',
    '/tools/imagetoprompt',
    '/knowledge-center',
    '/showcase',
    '/my-emotes',
  ]

  const staticUrls = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page === '' ? 1.0 : 0.8,
  }))

  return [
    ...staticUrls,
    ...emoteUrls,
  ]
}