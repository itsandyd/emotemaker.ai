import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section id="get-started" className="py-16 md:py-24 bg-gradient-to-r from-[#7928CA] to-[#FF0080] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-4">
            Ready to Transform Your Stream?
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto">
            Join thousands of streamers and Discord communities who elevate their
            visual identity with custom emotes.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button variant="default" size="lg" className="bg-white text-[#7928CA] hover:bg-gray-100" asChild>
            <a href="/pricing">View Pricing Plans</a>
          </Button>
          {/* <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
            <a href="#contact">Contact Us</a>
          </Button> */}
        </motion.div>

        <motion.div
          className="relative max-w-xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* <img
            src="https://cdn.pixabay.com/photo/2021/09/07/07/11/game-6603193_1280.jpg"
            alt="Streamer with custom emotes"
            className="w-full h-auto rounded-xl shadow-xl"
          /> */}
          {/* <motion.div
            className="absolute -bottom-5 -right-5 bg-white text-[#7928CA] rounded-lg px-4 py-2 shadow-lg text-sm font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <span>Try for free today!</span>
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  );
}
