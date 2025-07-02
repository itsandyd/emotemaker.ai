import { db } from '@/lib/db'
import KnowledgeCenter from './_components/KnowledgeCenter'

export const revalidate = 3600 // revalidate every hour

async function getArticles() {
  const articles = await db.article.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      slug: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return articles
}

export default async function KnowledgeCenterPage() {
  const articles = await getArticles()

  return (
    <div>
      <KnowledgeCenter initialArticles={articles} />
    </div>
  )
}