import { useState } from "react";
import { motion } from "framer-motion";
import { Star, GamepadIcon, UsersIcon, VideoIcon } from "lucide-react";

export interface Testimonial {
  id: number;
  name: string;
  title: string;
  avatar: string;
  content: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Samira",
    title: "Video Game Streamer",
    avatar: "https://cdn.pixabay.com/photo/2023/06/11/21/28/woman-8057032_1280.jpg",
    content: "EmoteMaker.ai is a game-changer! I created custom emotes for my channel in minutes that perfectly match my brand and personality.",
    rating: 5
  },
  {
    id: 2,
    name: "MegaCommunity",
    title: "Discord Community",
    avatar: "https://cdn.pixabay.com/photo/2016/11/29/13/14/attractive-1869761_1280.jpg",
    content: "This is phenomenal! Our entire Discord server now has custom-designed emotes that match our community vibe. The quality is outstanding.",
    rating: 4.5
  },
  {
    id: 3,
    name: "Carlos",
    title: "Content Creator",
    avatar: "https://cdn.pixabay.com/photo/2016/11/18/19/07/happy-1836445_1280.jpg",
    content: "EmoteMaker.ai was a total lifesaver for my rebrand! Created professional-quality emotes in minutes that my community loves.",
    rating: 5
  },
  {
    id: 4,
    name: "GamingHub",
    title: "Gaming Community",
    avatar: "https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083379_1280.jpg",
    content: "We needed unique emotes that stood out from other gaming communities, and EmoteMaker.ai delivered beyond our expectations!",
    rating: 5
  },
  {
    id: 5,
    name: "StreamerPro",
    title: "Twitch Partner",
    avatar: "https://cdn.pixabay.com/photo/2017/02/04/12/25/man-2037255_1280.jpg",
    content: "As a Twitch Partner, I need professional emotes that represent my brand. The AI-generated options gave me exactly what I needed.",
    rating: 4.5
  },
  {
    id: 6,
    name: "CreativeStudio",
    title: "Design Team",
    avatar: "https://cdn.pixabay.com/photo/2018/01/15/07/52/woman-3083390_1280.jpg",
    content: "Even as designers, we use EmoteMaker.ai to quickly prototype emote concepts for our clients. It saves us hours of initial sketching!",
    rating: 5
  }
];

export function TestimonialsSection() {
  const [activePage, setActivePage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  
  const getVisibleTestimonials = () => {
    const startIndex = activePage * itemsPerPage;
    return testimonials.slice(startIndex, startIndex + itemsPerPage);
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400" size={14} />);
    }
    
    if (halfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="text-yellow-400" size={14} />
          <Star className="absolute top-0 left-0 fill-yellow-400 text-yellow-400 w-1/2 overflow-hidden" size={14} />
        </div>
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-yellow-400" size={14} />);
    }
    
    return stars;
  };

  const getIconForTitle = (title: string) => {
    if (title.includes("Game") || title.includes("Streamer")) {
      return <GamepadIcon className="mr-1" size={12} />;
    } else if (title.includes("Community") || title.includes("Discord")) {
      return <UsersIcon className="mr-1" size={12} />;
    } else {
      return <VideoIcon className="mr-1" size={12} />;
    }
  };

  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-4">
            Loved by Streamers and Communities
          </h2>
          <p className="text-neutral-gray max-w-2xl mx-auto">
            See what creators are saying about their EmoteMaker.ai experience
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          {getVisibleTestimonials().map((testimonial: Testimonial, index: number) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card bg-white rounded-xl p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mr-4">
                  {/* <img
                    src={testimonial.avatar}
                    alt={`${testimonial.name} profile`}
                    className="w-10 h-10 rounded-full object-cover"
                  /> */}
                </div>
                <div>
                  <h4 className="font-semibold text-base">{testimonial.name}</h4>
                  <p className="text-xs text-neutral-gray flex items-center">
                    {getIconForTitle(testimonial.title)}
                    {testimonial.title}
                  </p>
                </div>
              </div>
              <p className="text-sm text-neutral-dark mb-4">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="flex text-yellow-400 text-xs">
                {renderRatingStars(testimonial.rating)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index: number) => (
            <button
              key={index}
              onClick={() => setActivePage(index)}
              className={`w-3 h-3 rounded-full transition-opacity ${
                activePage === index
                  ? "bg-primary-purple opacity-100"
                  : "bg-neutral-gray opacity-50"
              }`}
              aria-label={`Page ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
