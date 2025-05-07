import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export interface Emote {
  id: number;
  name: string;
  category: string;
  imageSrc: string;
}

export const emotes: Emote[] = [
  {
    id: 1,
    name: "capyblush",
    category: "Capybara",
    imageSrc: "/capyblush.png"
  },
  {
    id: 2,
    name: "alienAngry",
    category: "Alien",
    imageSrc: "/alienangry.png"
  },
  {
    id: 3,
    name: "shockedpup",
    category: "Pup",
    imageSrc: "/shockedpup.png"
  },
  {
    id: 4,
    name: "bambooPanda",
    category: "Panda",
    imageSrc: "/bamboopanda.png"
  },
  {
    id: 5,
    name: "alienConfused",
    category: "Alien",
    imageSrc: "/alienconfused.png"
  },
  {
    id: 6,
    name: "slothLove",
    category: "Sloth",
    imageSrc: "/slothlove.png"
  },
  {
    id: 7,
    name: "pepeThink",
    category: "Pepe",
    imageSrc: "/pepethink.png"
  },
  {
    id: 8,
    name: "ghostBoo",
    category: "Ghost",
    imageSrc: "/ghostboo.png"
  },
  {
    id: 9,
    name: "alienStupid",
    category: "Alien",
    imageSrc: "/alienstupid.png"
  },
  {
    id: 10,
    name: "duckyHello",
    category: "Ducky",
    imageSrc: "/duckyhello.png"
  }
];

export function GallerySection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-neutral-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-4">
            Emote Gallery
          </h2>
          <p className="text-neutral-gray max-w-2xl mx-auto">
            Browse through some of the amazing emotes created by our community
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {emotes.map((emote) => (
            <motion.div
              key={emote.id}
              className="emote-gallery-item bg-white rounded-xl p-3 shadow-sm transition-all duration-300 group cursor-pointer"
              variants={itemVariants}
            >
              <div className="aspect-square relative overflow-hidden rounded-lg">
                <Image
                  src={emote.imageSrc}
                  alt={`${emote.name} emote`}
                  width={150}
                  height={150}
                  className="object-contain w-full h-full"
                  unoptimized
                //   priority={emote.id <= 5} // Load first 5 images with priority
                />
              </div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-medium truncate">{emote.name}</p>
                <p className="text-xs text-neutral-gray">{emote.category}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* <Button variant="ghost" className="text-primary">
            <a href="#explore-more">Explore More Emotes</a>
          </Button> */}
        </motion.div>
      </div>
    </section>
  );
}
