"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import Image from "next/image"
import { HeartIcon, SparklesIcon, StarIcon, SmileIcon, TwitchIcon, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function KawaiiLanding() {
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
      <section className="relative w-full bg-gradient-to-r from-[#FFB7C5] to-[#FFC8DD] py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/heart-pattern.png')] opacity-10" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF69B4] to-transparent" />
        </div>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 relative z-10">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-extrabold tracking-tight text-[#4A154B] md:text-6xl lg:text-7xl"
              >
                Create Adorable Kawaii Emotes with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-[#4A154B]/90 max-w-xl"
              >
                Transform your stream with super cute kawaii emotes. Add a touch of adorable charm to your community!
              </motion.p>

              <ul className="list-disc list-inside text-[#4A154B]/80">
                <li>Adorable kawaii style</li>
                <li>AI-powered generation</li>
                <li>Perfect for Twitch & Discord</li>
              </ul>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={handleStartCreating} className="bg-[#FF69B4] text-white hover:bg-[#FF85C2] text-lg" size="lg">
                  Start Creating Kawaii Emotes
                </Button>
                <Button onClick={() => router.push('/showcase')} className="bg-transparent border-2 border-[#FF69B4] text-[#4A154B] hover:bg-[#FF69B4]/10 text-lg" size="lg">
                  View Gallery
                </Button>
              </div>
            </div>
            <div className="relative lg:ml-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/30 backdrop-blur-sm"
              >
                <Image
                  alt="Adorable Kawaii Girl Emote"
                  className="rounded-2xl"
                  height={800}
                  src="/kawaiigirl.png"
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
              <div className="absolute -bottom-4 -right-4 bg-[#FF69B4] p-4 rounded-lg shadow-lg">
                <p className="font-bold text-white">1000+ Kawaii Emotes Created!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#FFF5F7] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-[#4A154B]">Create Kawaii Emotes in 3 Easy Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "1. Describe Your Vision", description: "Tell our AI what kind of kawaii emote you want to create.", icon: HeartIcon },
              { title: "2. Generate Magic", description: "Watch as our AI brings your cute emote to life with multiple options.", icon: SparklesIcon },
              { title: "3. Perfect & Share", description: "Fine-tune your favorite design and share it with your community.", icon: StarIcon },
            ].map((step, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md text-center border border-[#FF69B4]/20"
              >
                <step.icon className="h-12 w-12 text-[#FF69B4] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-[#4A154B]">{step.title}</h3>
                <p className="text-[#4A154B]/80">{step.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button onClick={handleStartCreating} className="bg-[#FF69B4] text-white hover:bg-[#FF85C2] text-lg">
              Create Your First Kawaii Emote
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-[#4A154B]">Why Choose Our Kawaii Emotes?</h2>
            <p className="text-xl text-[#4A154B]/80 max-w-2xl mx-auto">
              Create adorable kawaii emotes that bring cuteness overload to your streams.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI-Powered Cuteness", description: "Create unique kawaii art from text descriptions.", icon: HeartIcon },
              { title: "One-Click Background Removal", description: "Instantly remove backgrounds for transparent emotes.", icon: SparklesIcon },
              { title: "Custom Editing Tools", description: "Fine-tune your emotes with our kawaii-perfect editor.", icon: ImageIcon },
              { title: "Multiple Art Styles", description: "Choose from various kawaii-inspired themes.", icon: StarIcon },
              { title: "Platform Ready", description: "Download emotes perfectly formatted for any platform.", icon: TwitchIcon },
              { title: "Instant Creation", description: "Get your kawaii emotes in seconds.", icon: SmileIcon },
            ].map((feature, index) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                key={index}
                className="bg-[#FFF5F7] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#FF69B4]/20"
              >
                <feature.icon className="h-8 w-8 text-[#FF69B4] mb-3" />
                <h3 className="text-xl font-bold mb-3 text-[#4A154B]">{feature.title}</h3>
                <p className="text-[#4A154B]/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-[#FFB7C5] to-[#FFC8DD] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-[#4A154B]">Loved by Kawaii Enthusiasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "KawaiiQueen",
                role: "Twitch Partner",
                image: "/kawaii-streamer.png",
                quote: "These kawaii emotes bring such a cute vibe to my channel. My viewers can't get enough of them!",
                link: "https://www.twitch.tv/kawaiiqueen"
              },
              {
                name: "CuteCreator",
                role: "Content Creator",
                image: "/cute-creator.png",
                quote: "The AI perfectly captures that adorable kawaii style. It's like having a cute artist on demand!",
                link: "https://www.youtube.com/cutecreator"
              },
              {
                name: "Moemaster",
                role: "Discord Community Leader",
                image: "/moe-master.png",
                quote: "Our anime community has never been more engaged. These kawaii emotes are pure cuteness!",
                link: "https://discord.gg/moemaster"
              }
            ].map((testimonial, index) => (
              <Link href={testimonial.link} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#FF69B4]/20"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar>
                      <AvatarImage alt={testimonial.name} src={testimonial.image} />
                      <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-[#4A154B]">{testimonial.name}</h4>
                      <p className="text-sm text-[#4A154B]/70">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-[#4A154B]/80 italic">&quot;{testimonial.quote}&quot;</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#FFB7C5] to-[#FFC8DD] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#4A154B] mb-6">
            Ready to Get Kawaii?
          </h2>
          <p className="text-xl text-[#4A154B]/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of streamers already using our AI to create adorable kawaii emotes that captivate their audience.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleStartCreating} className="bg-[#FF69B4] text-white hover:bg-[#FF85C2] text-lg" size="lg">
              Start Creating Your Kawaii Emotes Now
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
} 