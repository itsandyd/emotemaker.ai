"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import Image from "next/image"
import { SparkleIcon, WandIcon, CloudLightningIcon, TimerIcon, TwitchIcon, ComputerIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card"

export default function ChibiLanding() {
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
      <section className="relative w-full bg-gradient-to-r from-[#FF69B4] to-[#FFB6C1] py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl"
              >
                Create Adorable Chibi Emotes with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-white/90 max-w-xl"
              >
                Bring cuteness overload to your streams and Discord servers with AI-generated Chibi emotes. No artistic skills required!
              </motion.p>

              <ul className="list-disc list-inside text-white/80">
                <li>Adorable Chibi-style characters</li>
                <li>AI-powered generation</li>
                <li>Perfect for Twitch & Discord</li>
              </ul>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={handleStartCreating} className="bg-white text-[#FF69B4] hover:bg-gray-100 text-lg" size="lg">
                  Start Creating Chibi Emotes
                </Button>
                <Button onClick={() => router.push('/showcase')} className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg" size="lg">
                  View Chibi Gallery
                </Button>
              </div>
            </div>
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  alt="Cool Chibi with Sunglasses"
                  className="rounded-2xl"
                  height={800}
                  src="/andrewchibi.jpeg"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "auto",
                    background: "white",
                    padding: "1rem",
                  }}
                  width={800}
                  priority
                />
              </motion.div>
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                <p className="font-bold text-[#FF69B4]">500+ Chibi Emotes Created!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12">Create Chibi Emotes in 3 Easy Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "1. Describe Your Chibi", description: "Tell our AI what kind of cute Chibi character you want.", icon: SparkleIcon },
              { title: "2. Generate Options", description: "Our AI creates multiple adorable Chibi designs based on your description.", icon: WandIcon },
              { title: "3. Customize & Download", description: "Fine-tune your favorite Chibi and download it ready for use.", icon: CloudLightningIcon },
            ].map((step, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md text-center"
              >
                <step.icon className="h-12 w-12 text-[#FF69B4] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button onClick={handleStartCreating} className="bg-[#FF69B4] text-white hover:bg-[#FF1493] text-lg">
              Create Your First Chibi Emote
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Why Choose Our Chibi Emotes?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create professional-quality Chibi emotes with our advanced AI tools and stand out from the crowd.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI-Powered Chibi Generation", description: "Create unique Chibi characters from text descriptions.", icon: SparkleIcon },
              { title: "One-Click Background Removal", description: "Instantly remove backgrounds for transparent Chibi emotes.", icon: WandIcon },
              { title: "Custom Chibi Editing Tools", description: "Fine-tune your Chibis with our easy-to-use editor.", icon: ComputerIcon },
              { title: "Multiple Chibi Styles", description: "Choose from various Chibi art styles and themes.", icon: CloudLightningIcon },
              { title: "Twitch & Discord Ready", description: "Download Chibi emotes in the perfect format for your platform.", icon: TwitchIcon },
              { title: "Fast Generation", description: "Get your adorable Chibi emotes in seconds.", icon: TimerIcon },
            ].map((feature, index) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                key={index}
                className="bg-gray-100 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <feature.icon className="h-8 w-8 text-[#FF69B4] mb-3" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-[#FF69B4] to-[#FFB6C1] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-white">Loved by Chibi Enthusiasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "KawaiiStreamer",
                role: "Twitch Partner",
                image: "/kawaii-streamer.png",
                quote: "These Chibi emotes are exactly what my channel needed! My viewers can't get enough of them!",
                link: "https://www.twitch.tv/kawaiistreamer"
              },
              {
                name: "AnimeGamer",
                role: "YouTube Content Creator",
                image: "/anime-gamer.png",
                quote: "The AI generates such cute and unique Chibis. It's like having a personal artist for my channel!",
                link: "https://www.youtube.com/animegamer"
              },
              {
                name: "ChibiLover",
                role: "Discord Community Leader",
                image: "/chibi-lover.png",
                quote: "Our Discord server has never been more lively. These Chibi emotes add so much personality!",
                link: "https://discord.gg/chibilovers"
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
      <section className="bg-gradient-to-r from-[#FF69B4] to-[#FFB6C1] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-6">
            Ready to Chibi-fy Your Stream?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of streamers and communities already using our AI to create adorable Chibi emotes that captivate their audience.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleStartCreating} className="bg-white text-[#FF69B4] hover:bg-gray-100 text-lg" size="lg">
              Start Creating Your Chibi Emotes Now
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}