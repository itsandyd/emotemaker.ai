import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StoreIcon, Video, BookOpen } from "lucide-react"
import Link from "next/link"

const useCases = [
  { 
    title: "Marketplace", 
    description: "Buy and Sell emotes",
    icon: StoreIcon,
    href: "/marketplace"
  },
  { 
    title: "Tutorials", 
    description: "Learn emote creation techniques",
    icon: Video,
    href: "/tutorials"
  },
  { 
    title: "Knowledge Center", 
    description: "Find answers to common questions",
    icon: BookOpen,
    href: "/knowledge-center"
  },
]

export function UseCases() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Use Cases</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {useCases.map((useCase, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {useCase.title}
              </CardTitle>
              <useCase.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
              <Link href={useCase.href}>
                <Button className="w-full">Explore {useCase.title}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}