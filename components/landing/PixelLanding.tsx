"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import Image from "next/image"
import { SparkleIcon, WandIcon, CloudLightningIcon, TimerIcon, TwitchIcon, ComputerIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card"

export default function PixelLanding() {
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
      <section className="relative w-full bg-gradient-to-r from-[#2D0C5D] to-[#8A2BE2] py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/star-pattern.png')] opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF00FF] to-transparent" />
        </div>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 relative z-10">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl"
              >
                Create Retro Pixel Emotes with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-white/90 max-w-xl"
              >
                Transform your stream with nostalgic pixel art emotes. Bring the classic 8-bit charm to your community!
              </motion.p>

              <ul className="list-disc list-inside text-white/80">
                <li>Classic pixel art style</li>
                <li>AI-powered generation</li>
                <li>Perfect for Twitch & Discord</li>
              </ul>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={handleStartCreating} className="bg-[#FF00FF] text-white hover:bg-[#FF33FF] text-lg" size="lg">
                  Start Creating Pixel Emotes
                </Button>
                <Button onClick={() => router.push('/showcase')} className="bg-transparent border-2 border-[#FF00FF] text-white hover:bg-[#FF00FF]/10 text-lg" size="lg">
                  View Gallery
                </Button>
              </div>
            </div>
            <div className="relative lg:ml-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/30 backdrop-blur-sm"
              >
                <Image
                  alt="Retro Space Alien Pixel Art"
                  className="rounded-2xl"
                  height={800}
                  src="/beboppixel.png"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "auto",
                    imageRendering: "pixelated",
                    padding: "1rem",
                  }}
                  width={800}
                  priority
                />
              </motion.div>
              <div className="absolute -bottom-4 -right-4 bg-[#FF00FF] p-4 rounded-lg shadow-lg">
                <p className="font-bold text-white">500+ Pixel Emotes Created!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-white">Create Pixel Emotes in 3 Easy Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "1. Describe Your Vision", description: "Tell our AI what kind of retro pixel art emote you want to create.", icon: SparkleIcon },
              { title: "2. Generate Magic", description: "Watch as our AI brings your pixel art to life with multiple options.", icon: WandIcon },
              { title: "3. Perfect & Share", description: "Fine-tune your favorite design and share it with your community.", icon: CloudLightningIcon },
            ].map((step, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                key={index} 
                className="bg-gray-800 p-6 rounded-lg shadow-md text-center border border-[#FF00FF]/20"
              >
                <step.icon className="h-12 w-12 text-[#FF00FF] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button onClick={handleStartCreating} className="bg-[#FF00FF] text-white hover:bg-[#FF33FF] text-lg">
              Create Your First Pixel Emote
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-800 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-white">Why Choose Our Pixel Emotes?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Create nostalgic pixel art emotes that bring retro charm to your streams.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI-Powered Pixel Art", description: "Create unique pixel art from text descriptions.", icon: SparkleIcon },
              { title: "One-Click Background Removal", description: "Instantly remove backgrounds for transparent emotes.", icon: WandIcon },
              { title: "Custom Editing Tools", description: "Fine-tune your emotes with our pixel-perfect editor.", icon: ComputerIcon },
              { title: "Multiple Art Styles", description: "Choose from various retro-inspired themes.", icon: CloudLightningIcon },
              { title: "Platform Ready", description: "Download emotes perfectly formatted for any platform.", icon: TwitchIcon },
              { title: "Instant Creation", description: "Get your pixel art emotes in seconds.", icon: TimerIcon },
            ].map((feature, index) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                key={index}
                className="bg-gray-900 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#FF00FF]/20"
              >
                <feature.icon className="h-8 w-8 text-[#FF00FF] mb-3" />
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-[#2D0C5D] to-[#8A2BE2] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-white">Loved by Retro Enthusiasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "PixelPro",
                role: "Twitch Partner",
                image: "/pixel-pro.png",
                quote: "These pixel emotes bring such a nostalgic vibe to my channel. My viewers love the retro feel!",
                link: "https://www.twitch.tv/pixelpro"
              },
              {
                name: "RetroGamer",
                role: "Content Creator",
                image: "/retro-gamer.png",
                quote: "The AI perfectly captures that classic 8-bit style. It's like having a pixel artist on demand!",
                link: "https://www.youtube.com/retrogamer"
              },
              {
                name: "BitMaster",
                role: "Discord Community Leader",
                image: "/bit-master.png",
                quote: "Our gaming community has never been more engaged. These pixel emotes are pure nostalgia!",
                link: "https://discord.gg/bitmaster"
              }
            ].map((testimonial, index) => (
              <Link href={testimonial.link} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#FF00FF]/20"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar>
                      <AvatarImage alt={testimonial.name} src={testimonial.image} />
                      <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-300">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">&quot;{testimonial.quote}&quot;</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#2D0C5D] to-[#8A2BE2] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-6">
            Ready to Go Retro?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of streamers already using our AI to create nostalgic pixel art emotes that captivate their audience.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleStartCreating} className="bg-[#FF00FF] text-white hover:bg-[#FF33FF] text-lg" size="lg">
              Start Creating Your Pixel Emotes Now
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
} 