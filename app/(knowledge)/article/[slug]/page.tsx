import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ArticleContent from './_components/ArticleContent'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

async function getArticle(slug: string) {
  const article = await db.article.findUnique({
    where: {
      slug: slug,
    },
  })
  
  if (!article) {
    notFound()
  }

  return article
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(params.slug)
  
  return {
    title: article.title,
    description: article.content.substring(0, 160), // First 160 characters as description
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug)

  return (
    <div className="container mx-auto py-10">
      <ArticleContent article={article} />
    </div>
  )
}