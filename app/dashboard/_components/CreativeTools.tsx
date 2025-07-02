import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Paintbrush2 } from "lucide-react"
import Link from "next/link"

const creativeTools = [
  { 
    title: "Create", 
    description: "Create new emotes using AI",
    icon: Paintbrush2,
    href: "/emoteboard/editor/1"
  },
  // { 
  //   title: "Compose", 
  //   description: "Combine and edit emotes",
  //   icon: LayoutDashboard,
  //   href: "/emoteboard/editor/1"
  // },
  // { 
  //   title: "Enhance", 
  //   description: "Improve existing emotes",
  //   icon: Wand2,
  //   href: "/tools"
  // },
]

export function CreativeTools() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Creative Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creativeTools.map((tool, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {tool.title}
              </CardTitle>
              <tool.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
              <Link href={tool.href}>
                <Button className="w-full">Use {tool.title}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}