"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import Image from "next/image"
import { SparkleIcon, WandIcon, CloudLightningIcon, TimerIcon, TwitchIcon, ComputerIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card"

export default function CuteBoldLinesLanding() {
  const router = useRouter();

  const handleStartCreating = () => {
    router.push('/emoteboard/editor/new');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-[#FF69B4] to-[#4DEEEA] py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/tropical-pattern.png')] opacity-5" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 relative z-10">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl"
              >
                Create Bold & Vibrant Emotes with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-white/90 max-w-xl"
              >
                Stand out with eye-catching Cute Bold Lines emotes. Perfect for making your stream pop with personality!
              </motion.p>

              <ul className="list-disc list-inside text-white/80">
                <li>Bold, clean line art style</li>
                <li>AI-powered generation</li>
                <li>Perfect for Twitch & Discord</li>
              </ul>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={handleStartCreating} className="bg-white text-[#FF69B4] hover:bg-opacity-90 text-lg" size="lg">
                  Start Creating Bold Line Emotes
                </Button>
                <Button onClick={() => router.push('/showcase')} className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg" size="lg">
                  View Gallery
                </Button>
              </div>
            </div>
            <div className="relative lg:ml-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm"
              >
                <Image
                  alt="Cool Flamingo with Sunglasses"
                  className="rounded-2xl"
                  height={800}
                  src="/cblflamingo.png"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "auto",
                    padding: "1rem",
                  }}
                  width={800}
                  priority
                />
              </motion.div>
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                <p className="font-bold text-[#FF69B4]">500+ Bold Line Emotes Created!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12">Create Bold Line Emotes in 3 Easy Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "1. Describe Your Style", description: "Tell our AI what kind of bold and vibrant emote you want to create.", icon: SparkleIcon },
              { title: "2. Generate Magic", description: "Watch as our AI brings your bold line art to life with multiple options.", icon: WandIcon },
              { title: "3. Perfect & Share", description: "Fine-tune your favorite design and share it with your community.", icon: CloudLightningIcon },
            ].map((step, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md text-center"
              >
                <step.icon className="h-12 w-12 text-[#4DEEEA] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button onClick={handleStartCreating} className="bg-[#FF69B4] text-white hover:bg-[#FF4DA6] text-lg">
              Create Your First Bold Line Emote
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Why Choose Our Bold Line Emotes?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create eye-catching emotes that stand out in any chat with our bold, clean style.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI-Powered Bold Lines", description: "Create unique bold line art from text descriptions.", icon: SparkleIcon },
              { title: "One-Click Background Removal", description: "Instantly remove backgrounds for transparent emotes.", icon: WandIcon },
              { title: "Custom Editing Tools", description: "Fine-tune your emotes with our precision editor.", icon: ComputerIcon },
              { title: "Multiple Art Styles", description: "Choose from various bold and vibrant themes.", icon: CloudLightningIcon },
              { title: "Platform Ready", description: "Download emotes perfectly formatted for any platform.", icon: TwitchIcon },
              { title: "Instant Creation", description: "Get your bold line emotes in seconds.", icon: TimerIcon },
            ].map((feature, index) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                key={index}
                className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <feature.icon className="h-8 w-8 text-[#4DEEEA] mb-3" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-[#FF69B4] to-[#4DEEEA] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-white">Loved by Content Creators</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "BoldCreator",
                role: "Twitch Partner",
                image: "/bold-creator.png",
                quote: "These bold line emotes make my channel stand out! The style is exactly what I was looking for.",
                link: "https://www.twitch.tv/boldcreator"
              },
              {
                name: "LineArtist",
                role: "Content Creator",
                image: "/line-artist.png",
                quote: "The AI nails the bold line style every time. My viewers can't get enough of these emotes!",
                link: "https://www.youtube.com/lineartist"
              },
              {
                name: "EmoteMaster",
                role: "Discord Community Leader",
                image: "/emote-master.png",
                quote: "Clean, bold, and instantly recognizable. These emotes are perfect for our community!",
                link: "https://discord.gg/emotemaster"
              }
            ].map((testimonial, index) => (
              <Link href={testimonial.link} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar>
                      <AvatarImage alt={testimonial.name} src={testimonial.image} />
                      <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">&quot;{testimonial.quote}&quot;</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#FF69B4] to-[#4DEEEA] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-6">
            Ready to Make Your Stream Pop?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of streamers already using our AI to create bold, vibrant emotes that make their channels stand out.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleStartCreating} className="bg-white text-[#FF69B4] hover:bg-opacity-90 text-lg" size="lg">
              Start Creating Your Bold Line Emotes Now
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
} 