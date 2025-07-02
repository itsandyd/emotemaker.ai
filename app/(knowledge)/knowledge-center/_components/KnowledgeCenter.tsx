"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Search, Book, Video, MessageCircle, HelpCircle } from "lucide-react"
import Link from "next/link"

interface Category {
  name: string;
  icon: React.ElementType;
}

interface Article {
  id: string;
  title: string;
  category: string;
  slug: string;
}

const categories: Category[] = [
  { name: "Getting Started", icon: Book },
  { name: "Tutorials", icon: Video },
  { name: "FAQs", icon: HelpCircle },
  { name: "Community", icon: MessageCircle },
]

interface KnowledgeCenterProps {
  initialArticles: Article[];
}

export default function KnowledgeCenter({ initialArticles }: KnowledgeCenterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredArticles = initialArticles.filter(article => 
    (activeCategory === "All" || article.category === activeCategory) &&
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Knowledge Center</h1>
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <Tabs defaultValue="All" className="mb-8">
        <TabsList>
          <TabsTrigger value="All">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.name} value={category.name}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="All">
          <ArticleGrid articles={filteredArticles} />
        </TabsContent>
        {categories.map((category) => (
          <TabsContent key={category.name} value={category.name}>
            <ArticleGrid
              articles={filteredArticles.filter(
                (article) => article.category === category.name
              )}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ArticleGrid({ articles }: { articles: Article[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{article.category}</p>
              <Link href={`/article/${article.slug}`}>
                <Button variant="outline">Read More</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}