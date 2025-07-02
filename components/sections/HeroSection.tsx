"use client"

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-gradient-to-r from-[#7928CA] to-[#FF0080] pt-28 pb-16 md:pt-32 md:pb-20 text-white" id="hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div
            className="md:w-1/2 mb-10 md:mb-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading leading-tight mb-4"
              variants={itemVariants}
            >
              Create Custom Emotes in Seconds with AI
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl opacity-90 mb-8 max-w-lg"
              variants={itemVariants}
            >
              Empower your Twitch streams and Discord communities with unique,
              AI-generated emotes, no special skills needed.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <Button variant="default" size="lg" className="bg-white text-[#7928CA] hover:bg-gray-100">
                <a href="#get-started">Get Started Now</a>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-[#7928CA] hover:bg-white/10">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="md:w-1/2 relative"
            initial={{ opacity: 0, rotate: -2, y: 20 }}
            animate={{ opacity: 1, rotate: 2, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-white rounded-xl p-3 shadow-xl max-w-md mx-auto transform rotate-2">
              <Image
                src="/showcase.svg"
                alt="Gallery of AI-generated custom streaming emotes"
                className="rounded-lg w-full h-auto"
                width={1000}
                height={1000}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 bg-white rounded-lg px-3 py-2 shadow-md text-xs text-neutral-dark"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <span className="font-medium text-[#7928CA]">30,000+ Emotes Created</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 