import { motion } from "framer-motion";
import { 
  LayersIcon, PaletteIcon, CropIcon, SlidersIcon, 
  TwitchIcon, RefreshCwIcon, WandIcon, ScissorsIcon, 
  MessageSquareIcon, ZapIcon
} from "lucide-react";
import { SiDiscord } from "react-icons/si";

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: any;
  iconBgClass?: string;
}

export const mainFeatures: Feature[] = [
  {
    id: 1,
    title: "Multiple AI Models",
    description: "Choose between Dall-E 3, Flux, Image-1, Imagen, and more for diverse creative styles and options.",
    icon: LayersIcon,
    iconBgClass: "bg-indigo-100"
  },
  {
    id: 2,
    title: "Style Variety",
    description: "Create designs in pixel art, realistic, vectorial, and more styles with a single prompt.",
    icon: PaletteIcon,
    iconBgClass: "bg-purple-100"
  },
  {
    id: 3,
    title: "One-Click Background Removal",
    description: "Instantly remove backgrounds for transparent emotes and stickers.",
    icon: CropIcon,
    iconBgClass: "bg-blue-100" 
  },
  {
    id: 4,
    title: "Custom Editing Tools",
    description: "Fine-tune your emotes and stickers with our easy-to-use editor.",
    icon: SlidersIcon,
    iconBgClass: "bg-pink-100"
  },
  {
    id: 5,
    title: "Platform Ready",
    description: "Download designs optimized for Twitch, Discord, and other platforms automatically.",
    icon: TwitchIcon,
    iconBgClass: "bg-fuchsia-100"
  },
  {
    id: 6,
    title: "Continuous Updates",
    description: "New AI models and features added regularly to improve your creative options.",
    icon: RefreshCwIcon,
    iconBgClass: "bg-teal-100"
  }
];

export const powerfulFeatures: Feature[] = [
  {
    id: 1,
    title: "AI-Powered Generation",
    description: "Create unique emotes from text descriptions with cutting-edge AI models.",
    icon: WandIcon
  },
  {
    id: 2,
    title: "One-Click Background Removal",
    description: "Instantly remove backgrounds for transparent emotes and stickers.",
    icon: ScissorsIcon
  },
  {
    id: 3,
    title: "Custom Editing Tools",
    description: "Fine-tune your emotes with our easy-to-use editor.",
    icon: SlidersIcon
  },
  {
    id: 4,
    title: "Multiple Style Options",
    description: "Choose from pixel art, cartoon, 3D, and more styles to match your brand.",
    icon: LayersIcon
  },
  {
    id: 5,
    title: "Platform Ready",
    description: "Download emotes in the perfect formats for Twitch, Discord and more.",
    icon: SiDiscord
  },
  {
    id: 6,
    title: "Flexible Pricing",
    description: "Choose the monthly plan or buy credits as you need to fit your budget.",
    icon: ZapIcon
  }
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-4">
            Advanced AI Features
          </h2>
          <p className="text-neutral-gray max-w-2xl mx-auto">
            Leverage cutting-edge AI models to create professional-quality custom emotes
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {mainFeatures.map((feature) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.id}
                className="feature-card bg-white rounded-xl p-6 shadow-sm border border-neutral-light/80 transition-all duration-300"
                variants={itemVariants}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.iconBgClass} text-primary-purple mb-5`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-gray">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
