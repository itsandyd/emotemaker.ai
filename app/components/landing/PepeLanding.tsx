"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import Image from "next/image"
import { SparkleIcon, WandIcon, CloudLightningIcon, TimerIcon, TwitchIcon, ComputerIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card"

export default function PepeLanding() {
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
      <section className="relative w-full bg-[#E8E6E3] py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4FC25C]/20 to-[#4B9EFF]/20" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 relative z-10">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl lg:text-7xl"
              >
                Create Hilarious Pepe Emotes with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-700 max-w-xl"
              >
                Add the perfect Pepe reactions to your streams and Discord servers with AI-generated emotes. No artistic skills needed!
              </motion.p>

              <ul className="list-disc list-inside text-gray-600">
                <li>Classic Pepe-style expressions</li>
                <li>AI-powered generation</li>
                <li>Perfect for Twitch & Discord</li>
              </ul>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={handleStartCreating} className="bg-[#4FC25C] text-white hover:bg-[#45AE51] text-lg" size="lg">
                  Start Creating Pepe Emotes
                </Button>
                {/* <Button onClick={() => router.push('/showcase')} className="bg-[#4B9EFF] text-white hover:bg-[#4B9EFF]/90 text-lg" size="lg">
                  View Pepe Gallery
                </Button> */}
              </div>
            </div>
            <div className="relative lg:ml-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  alt="Pepe Face Splash Emote"
                  className="rounded-2xl"
                  height={600}
                  src="/pepefacesplash.jpg"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "auto",
                  }}
                  width={800}
                  priority
                />
              </motion.div>
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                <p className="font-bold text-[#4FC25C]">500+ Pepe Emotes Created!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12">Create Pepe Emotes in 3 Easy Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "1. Describe Your Pepe", description: "Tell our AI what kind of Pepe expression or emotion you want.", icon: SparkleIcon },
              { title: "2. Generate Options", description: "Our AI creates multiple hilarious Pepe designs based on your description.", icon: WandIcon },
              { title: "3. Customize & Download", description: "Fine-tune your favorite Pepe and download it ready for use.", icon: CloudLightningIcon },
            ].map((step, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md text-center"
              >
                <step.icon className="h-12 w-12 text-[#4B9EFF] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button onClick={handleStartCreating} className="bg-[#4FC25C] text-white hover:bg-[#45AE51] text-lg">
              Create Your First Pepe Emote
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Why Choose Our Pepe Emotes?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create professional-quality Pepe emotes with our advanced AI tools and make your chat more expressive.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI-Powered Pepe Generation", description: "Create unique Pepe expressions from text descriptions.", icon: SparkleIcon },
              { title: "One-Click Background Removal", description: "Instantly remove backgrounds for transparent Pepe emotes.", icon: WandIcon },
              { title: "Custom Pepe Editing Tools", description: "Fine-tune your Pepes with our easy-to-use editor.", icon: ComputerIcon },
              { title: "Multiple Pepe Styles", description: "Choose from various Pepe art styles and themes.", icon: CloudLightningIcon },
              { title: "Twitch & Discord Ready", description: "Download Pepe emotes in the perfect format for your platform.", icon: TwitchIcon },
              { title: "Fast Generation", description: "Get your hilarious Pepe emotes in seconds.", icon: TimerIcon },
            ].map((feature, index) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                key={index}
                className="bg-gray-100 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <feature.icon className="h-8 w-8 text-[#4B9EFF] mb-3" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-[#4FC25C] to-[#4B9EFF] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-white">Loved by Pepe Enthusiasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "PepeStreamer",
                role: "Twitch Partner",
                image: "/pepe-streamer.png",
                quote: "These Pepe emotes are exactly what my channel needed! My chat is more alive than ever!",
                link: "https://www.twitch.tv/pepestreamer"
              },
              {
                name: "MemeGamer",
                role: "YouTube Content Creator",
                image: "/meme-gamer.png",
                quote: "The AI generates such perfect Pepe expressions. It's like having a meme artist for my channel!",
                link: "https://www.youtube.com/memegamer"
              },
              {
                name: "PepeLord",
                role: "Discord Community Leader",
                image: "/pepe-lord.png",
                quote: "Our Discord server has never been more entertaining. These Pepe emotes are pure gold!",
                link: "https://discord.gg/pepelord"
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
      <section className="bg-gradient-to-r from-[#4FC25C] to-[#4B9EFF] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-6">
            Ready to Pepe-fy Your Stream?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of streamers and communities already using our AI to create hilarious Pepe emotes that engage their audience.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleStartCreating} className="bg-white text-[#4FC25C] hover:bg-gray-100 text-lg" size="lg">
              Start Creating Your Pepe Emotes Now
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
} 