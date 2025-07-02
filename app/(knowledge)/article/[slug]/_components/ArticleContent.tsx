"use client"

import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

interface ArticleContentProps {
  article: {
    id: string
    title: string
    content: string
    category: string
    publishedAt: Date | null
    author: string | null  // Change this line to allow null
  }
}

export default function ArticleContent({ article }: ArticleContentProps) {
  if (!article) {
    return notFound()
  }

  const formattedDate = article.publishedAt 
    ? new Date(article.publishedAt).toLocaleDateString() 
    : 'Not published'

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">{article.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${article.author || 'Anonymous'}`} alt={article.author || 'Anonymous'} />
              <AvatarFallback>{article.author ? article.author[0] : 'A'}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">by {article.author || 'Anonymous'}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Category: {article.category} | Published: {formattedDate}
          </p>
        </CardHeader>
        <CardContent>
          <article className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
              }}
            >
              {article.content}
            </ReactMarkdown>
          </article>
        </CardContent>
      </Card>
    </div>
  )
}