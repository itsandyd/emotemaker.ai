import { motion } from "framer-motion";
import { Upload, Download, Wand2 } from "lucide-react";

import { FaTwitch, FaDiscord } from "react-icons/fa";
import { Button } from "../ui/button";

export function ProcessSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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
    <section id="how-it-works" className="py-16 md:py-24 bg-neutral-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-4">
            Create Emotes with Advanced AI
          </h2>
          <p className="text-neutral-gray max-w-2xl mx-auto">
            Our simple three-step process makes creating custom emotes effortless
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Step 1 */}
          <motion.div
            className="bg-white rounded-xl p-8 shadow-md"
            variants={itemVariants}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-purple/10 text-primary-purple mb-6">
              <Upload size={20} />
            </div>
            <h3 className="text-xl font-semibold mb-3">1. Describe Your Idea</h3>
            <p className="text-neutral-gray mb-4">
              Tell us in a few words or emojis what idea to create.
            </p>
            <ul className="text-sm text-neutral-gray space-y-2">
              <li className="flex items-start">
                <span className="text-primary-purple mr-2">✓</span>
                <span>Use descriptive language</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-purple mr-2">✓</span>
                <span>Specify style and theme</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-purple mr-2">✓</span>
                <span>Include emotion or action</span>
              </li>
            </ul>
          </motion.div>

          {/* Step 2 */}
          <motion.div
        className="bg-white rounded-xl p-8 shadow-md"
            variants={itemVariants}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-purple/10 text-primary-purple mb-6">
              <Wand2 size={20} />
            </div>
            <h3 className="text-xl font-semibold mb-3">2. Choose Your Options</h3>
            <p className="text-neutral-gray mb-4">
              Select your preferred style variations.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {/* Style variations preview */}
              <div className="bg-neutral-light rounded-lg p-2"></div>
              <div className="bg-neutral-light rounded-lg p-2"></div>
              <div className="bg-neutral-light rounded-lg p-2"></div>
            </div>
            <p className="text-sm text-neutral-gray">
              Pick from multiple styles and customize to your liking
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            className="bg-white rounded-xl p-8 shadow-md"
            variants={itemVariants}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-purple/10 text-primary-purple mb-6">
              <Download size={20} />
            </div>
            <h3 className="text-xl font-semibold mb-3">3. Download & Use</h3>
            <p className="text-neutral-gray mb-4">
              Get your emotes instantly ready for Twitch, Discord and more.
            </p>
            <div className="flex items-center gap-3 mb-2">
              <FaTwitch className="text-[#6441a5]" size={18} />
              <FaDiscord className="text-[#5865F2]" size={18} />
              <span className="text-xs bg-neutral-light rounded-full px-2 py-1">More</span>
            </div>
            <p className="text-sm text-neutral-gray">
              Platform-ready files in the perfect format and size
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button asChild>
            <a href="#get-started">Get Started Now</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
