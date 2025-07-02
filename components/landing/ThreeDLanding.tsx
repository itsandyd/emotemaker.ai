"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import Image from "next/image"
import { Gamepad2Icon, SparklesIcon, MonitorPlayIcon, TwitchIcon, ZapIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaCube } from "react-icons/fa"

export default function ThreeDLanding() {
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
      <section className="relative w-full bg-gradient-to-r from-[#1A1A2E] to-[#16213E] py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4EEAFF] to-transparent" />
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
                Create Epic 3D Emotes with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-white/90 max-w-xl"
              >
                Level up your stream with stunning 3D emotes. Add depth and dimension to your community&apos;s reactions!
              </motion.p>

              <ul className="list-disc list-inside text-white/80">
                <li>High-quality 3D style</li>
                <li>AI-powered generation</li>
                <li>Perfect for Twitch & Discord</li>
              </ul>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={handleStartCreating} className="bg-[#4EEAFF] text-[#1A1A2E] hover:bg-[#7FF4FF] text-lg" size="lg">
                  Start Creating 3D Emotes
                </Button>
                <Button onClick={() => router.push('/showcase')} className="bg-transparent border-2 border-[#4EEAFF] text-white hover:bg-[#4EEAFF]/10 text-lg" size="lg">
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
                  alt="Cool 3D Alien Gamer Emote"
                  className="rounded-2xl"
                  height={800}
                  src="/alien3d.png"
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
              <div className="absolute -bottom-4 -right-4 bg-[#4EEAFF] p-4 rounded-lg shadow-lg">
                <p className="font-bold text-[#1A1A2E]">2000+ 3D Emotes Created!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#0F172A] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-white">Create 3D Emotes in 3 Easy Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "1. Describe Your Vision", description: "Tell our AI what kind of 3D emote you want to create.", icon: Gamepad2Icon },
              { title: "2. Generate Magic", description: "Watch as our AI brings your 3D emote to life with multiple options.", icon: SparklesIcon },
              { title: "3. Perfect & Share", description: "Fine-tune your favorite design and share it with your community.", icon: FaCube },
            ].map((step, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                key={index} 
                className="bg-[#1E293B] p-6 rounded-lg shadow-md text-center border border-[#4EEAFF]/20"
              >
                <step.icon className="h-12 w-12 text-[#4EEAFF] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                <p className="text-white/80">{step.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button onClick={handleStartCreating} className="bg-[#4EEAFF] text-[#1A1A2E] hover:bg-[#7FF4FF] text-lg">
              Create Your First 3D Emote
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#1A1A2E] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-white">Why Choose Our 3D Emotes?</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Create stunning 3D emotes that bring depth and dimension to your streams.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI-Powered 3D Art", description: "Create unique 3D art from text descriptions.", icon: FaCube },
              { title: "One-Click Background Removal", description: "Instantly remove backgrounds for transparent emotes.", icon: SparklesIcon },
              { title: "Custom Editing Tools", description: "Fine-tune your emotes with our 3D-perfect editor.", icon: MonitorPlayIcon },
              { title: "Multiple Art Styles", description: "Choose from various 3D-inspired themes.", icon: Gamepad2Icon },
              { title: "Platform Ready", description: "Download emotes perfectly formatted for any platform.", icon: TwitchIcon },
              { title: "Instant Creation", description: "Get your 3D emotes in seconds.", icon: ZapIcon },
            ].map((feature, index) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                key={index}
                className="bg-[#16213E] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#4EEAFF]/20"
              >
                <feature.icon className="h-8 w-8 text-[#4EEAFF] mb-3" />
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-[#1A1A2E] to-[#16213E] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-white">Loved by Gaming Creators</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "ProGamer",
                role: "Twitch Partner",
                image: "/gamer-pro.png",
                quote: "These 3D emotes bring such an epic vibe to my channel. My viewers love the depth and style!",
                link: "https://www.twitch.tv/progamer"
              },
              {
                name: "GameMaster",
                role: "Content Creator",
                image: "/game-master.png",
                quote: "The AI perfectly captures that modern 3D style. It's like having a 3D artist on demand!",
                link: "https://www.youtube.com/gamemaster"
              },
              {
                name: "TechWizard",
                role: "Discord Community Leader",
                image: "/tech-wizard.png",
                quote: "Our gaming community has never been more engaged. These 3D emotes are pure fire!",
                link: "https://discord.gg/techwizard"
              }
            ].map((testimonial, index) => (
              <Link href={testimonial.link} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-[#1E293B] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#4EEAFF]/20"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar>
                      <AvatarImage alt={testimonial.name} src={testimonial.image} />
                      <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-white/70">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-white/80 italic">&quot;{testimonial.quote}&quot;</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#1A1A2E] to-[#16213E] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-6">
            Ready to Go 3D?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of streamers already using our AI to create stunning 3D emotes that captivate their audience.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleStartCreating} className="bg-[#4EEAFF] text-[#1A1A2E] hover:bg-[#7FF4FF] text-lg" size="lg">
              Start Creating Your 3D Emotes Now
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
} 