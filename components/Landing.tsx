"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import Image from "next/image"
import { CloudLightningIcon, ComputerIcon, SparkleIcon, TimerIcon, TwitchIcon, WandIcon, CreditCardIcon, DollarSignIcon, PaletteIcon, ScissorsIcon, PencilIcon, DownloadIcon, RefreshCwIcon, CheckIcon, SettingsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useProModal } from "@/hooks/use-pro-modal"
import { checkSubscription } from "@/lib/subscription"
import axios from "axios"
import toast from "react-hot-toast"
import { useUser } from "@clerk/nextjs"
import { generation } from "@/app/features/editor/types";
import { motion } from "framer-motion";
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card"

// Declare the Rewardful types
declare global {
  interface Window {
    rewardful: (event: string, callback: () => void) => void;
    Rewardful: {
      referral: string | null;
    };
  }
}

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const { user } = useUser()
  const router = useRouter();
  const proModal = useProModal();

  useEffect(() => {
    const fetchIsPro = async () => {
      const proStatus = await checkSubscription();
      setIsPro(proStatus);
    };

    fetchIsPro();
  }, []);

  const handleStartCreating = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/sign-in');
    }
  };

  const createCheckoutSession = async (plan: string) => {
    try {
      const referralParam = referral ? `?referral=${referral}` : '';
      const response = await fetch(`/api/stripe/subscriptions/${plan}${referralParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const onBasicSubscribe = () => createCheckoutSession('basic');
  const onStandardSubscribe = () => createCheckoutSession('standard');
  const onPremiumSubscribe = () => createCheckoutSession('premium');

  const [referral, setReferral] = useState<string | null>(null);

  useEffect(() => {
    const checkRewardful = () => {
      if (typeof window !== 'undefined' && window.Rewardful && typeof window.Rewardful === 'object') {
        setReferral(window.Rewardful.referral);
      }
    };

    // Check immediately in case Rewardful is already loaded
    checkRewardful();

    // Set up an interval to check periodically
    const intervalId = setInterval(checkRewardful, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const createCreditCheckoutSession = async (pack: string) => {
    try {
      let route = '';
      switch (pack) {
        case 'small':
          route = '/api/stripe/credits/small';
          break;
        case 'medium':
          route = '/api/stripe/credits/medium';
          break;
        case 'large':
          route = '/api/stripe/credits/large';
          break;
        default:
          console.error('Invalid pack size');
          return;
      }

      const referralParam = referral ? `?referral=${referral}` : '';
      const response = await fetch(`${route}${referralParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating credit checkout session:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Hero Section - Optimized */}
      <section className="relative w-full bg-gradient-to-r from-[#7928CA] to-[#FF0080] py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl"
              >
                Create Custom Emotes in Seconds with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-white/90 max-w-xl"
              >
                Empower your Twitch streams and Discord communities with unique, AI-generated emotes. No design skills needed!
              </motion.p>

              <ul className="list-disc list-inside text-white/80">
                <li>No design skills needed</li>
                <li>AI-powered</li>
                <li>Twitch & Discord ready</li>
              </ul>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={handleStartCreating} className="bg-white text-[#7928CA] hover:bg-gray-100 text-lg" size="lg">
                  Start Creating
                </Button>
                {/* <Button onClick={() => router.push('/marketplace')} className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg" size="lg">
                  View Emote Marketplace
                </Button> */}
              </div>
            </div>
            <div className="relative">
              <Image
                alt="AI-Generated Emotes Collage"
                className="rounded-xl shadow-2xl"
                height={600}
                src="/hero.png"
                style={{
                  aspectRatio: "800/600",
                  objectFit: "cover",
                }}
                width={800}
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                <p className="font-bold text-[#7928CA]">20,000+ Emotes Created!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      {/* <section className="bg-white py-12">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-lg text-gray-600">Trusted by streamers and communities on:</p>
          <div className="flex justify-center items-center space-x-8 mt-6">
            <Image src="/twitch-logo.svg" alt="Twitch" width={120} height={40} />
            <Image src="/discord-logo.svg" alt="Discord" width={120} height={40} />
            <Image src="/youtube-logo.svg" alt="YouTube" width={120} height={40} />
          </div>
        </div>
      </section> */}

      {/* How It Works - Updated and Redesigned */}
      <section className="bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12">Create Emotes with Advanced AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: SparkleIcon,
                title: "1. Describe Your Idea",
                description: "Tell our AI what kind of emote you want to create.",
                details: [
                  "Use descriptive language",
                  "Specify style (e.g., chibi, pixel art)",
                  "Include emotions or actions",
                  "Mention color preferences"
                ]
              },
              {
                icon: WandIcon,
                title: "2. Choose Your AI Model",
                description: "Select from our range of specialized AI models.",
                models: generation.models.map(model => model.name),
              },
              {
                icon: CloudLightningIcon,
                title: "3. Customize & Download",
                description: "Fine-tune your favorite design and download it ready for use.",
                features: [
                  "Adjust colors and effects",
                  "Add text or additional elements",
                  "Resize for platform requirements",
                  "Download in various formats (PNG, GIF)"
                ]
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col h-full"
              >
                <step.icon className="h-12 w-12 text-[#7928CA] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                {step.details && (
                  <ul className="text-sm text-gray-500 space-y-1 mb-4 text-left">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center">
                        <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
                {step.models && (
                  <div className="mt-auto">
                    <h4 className="font-semibold mb-2">Available Models:</h4>
                    <ul className="text-sm text-gray-500 space-y-1">
                      {step.models.map((model, modelIndex) => (
                        <li key={modelIndex} className="bg-gray-100 rounded px-2 py-1">
                          {model}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.features && (
                  <ul className="text-sm text-gray-500 space-y-1 mt-auto text-left">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <SettingsIcon className="h-4 w-4 mr-2 text-blue-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button onClick={handleStartCreating} className="bg-[#7928CA] text-white hover:bg-[#6a23b3] text-lg">
              Start Creating Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Updated to highlight AI capabilities */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Advanced AI Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leverage cutting-edge AI models to create professional-quality emotes for any platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Multiple AI Models", description: "Choose from DALL-E 3, FLUX, and Aura Flow for diverse emote styles.", icon: SparkleIcon },
              { title: "Style Variety", description: "Create emotes in chibi, pixel art, realistic, and more styles.", icon: PaletteIcon },
              { title: "One-Click Background Removal", description: "Instantly remove backgrounds for transparent emotes.", icon: ScissorsIcon },
              { title: "Custom Editing Tools", description: "Fine-tune your emotes with our easy-to-use editor.", icon: PencilIcon },
              { title: "Platform Ready", description: "Download emotes optimized for Twitch, Discord, and more.", icon: DownloadIcon },
              { title: "Continuous Updates", description: "We're constantly adding new AI models and features.", icon: RefreshCwIcon },
            ].map((feature, index) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                key={index}
                className="bg-gray-100 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <feature.icon className="h-8 w-8 text-[#7928CA] mb-3" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Optimized */}
      <section className="bg-gradient-to-r from-[#7928CA] to-[#FF0080] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-white">Loved by Streamers and Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Notloc",
                role: "Twitch Streamer",
                image: "/notloc.png",
                quote: "EmoteMaker.ai is a game-changer! I created custom emotes that perfectly match my stream&apos;s vibe in minutes.",
                link: "https://www.twitch.tv/xnotloc"
              },
              {
                name: "GoldenTurtleBoy",
                role: "Twitch Streamer",
                image: "/goldenturtle.png",
                quote: "The AI generated so many adorable designs for my channel. My viewers absolutely love the new emotes!",
                link: "https://www.twitch.tv/goldenturtleboy"
              },
              {
                name: "Ducky",
                role: "Discord Community Leader",
                image: "/ducky.png",
                quote: "EmoteMaker.ai was a total lifesaver for our Discord! We now have unique emotes that represent our community perfectly.",
                link: "https://discord.gg/33uK96vD9N"
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

      {/* Pricing and Features */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create professional-quality emotes with our advanced tools and choose a plan that fits your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI-Powered Generation", description: "Create unique emotes from text descriptions with enhanced prompts.", icon: SparkleIcon },
              { title: "One-Click Background Removal", description: "Instantly remove backgrounds for transparent emotes.", icon: WandIcon },
              { title: "Custom Editing Tools", description: "Fine-tune your emotes with our easy-to-use editor.", icon: ComputerIcon },
              { title: "Multiple Style Options", description: "Choose from pixel art, kawaii, 3D, and more styles.", icon: CloudLightningIcon },
              { title: "Twitch & Discord Ready", description: "Download emotes in the perfect format for your platform.", icon: TwitchIcon },
              { title: "Flexible Pricing", description: "Choose from monthly plans or buy credits as you need them.", icon: TimerIcon },
            ].map((feature, index) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                key={index}
                className="bg-gray-100 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <feature.icon className="h-8 w-8 text-[#7928CA] mb-3" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          {/* <div className="mt-12 text-center">
            <p className="text-lg text-gray-600 mb-4">
              Explore our pricing options or purchase credits for one-time use.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.push('/pricing')} className="bg-[#7928CA] text-white hover:bg-[#6a23b3]">
                View Pricing Plans
              </Button>
              <Button onClick={() => router.push('/credits')} variant="outline" className="border-[#7928CA] text-[#7928CA] hover:bg-[#7928CA] hover:text-white">
                Buy Credits
              </Button>
            </div>
          </div> */}
        </div>
      </section>

      {/* Pricing - New Section */}
      {/* <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="border rounded-lg p-8 text-center"
            >
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <p className="text-4xl font-bold mb-6">$5<span className="text-lg font-normal">/month</span></p>
              <ul className="text-left mb-8">
                <li className="mb-2 flex items-center"><CreditCardIcon className="h-5 w-5 text-purple-500 mr-2" /> 50 credits/month</li>
                <li className="mb-2 flex items-center"><DollarSignIcon className="h-5 w-5 text-purple-500 mr-2" /> Additional credits at $0.12 each</li>
              </ul>
              <Button onClick={onBasicSubscribe} className="w-full bg-[#7928CA] text-white hover:bg-[#6a23b3]">Choose Basic</Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="border-4 border-[#7928CA] rounded-lg p-8 text-center relative"
            >
              <div className="absolute top-0 right-0 bg-[#7928CA] text-white py-1 px-4 rounded-bl-lg">Most Popular</div>
              <h3 className="text-2xl font-bold mb-4">Standard</h3>
              <p className="text-4xl font-bold mb-6">$10<span className="text-lg font-normal">/month</span></p>
              <ul className="text-left mb-8">
                <li className="mb-2 flex items-center"><CreditCardIcon className="h-5 w-5 text-purple-500 mr-2" /> 150 credits/month</li>
                <li className="mb-2 flex items-center"><DollarSignIcon className="h-5 w-5 text-purple-500 mr-2" /> Additional credits at $0.10 each</li>
              </ul>
              <Button onClick={onStandardSubscribe} className="w-full bg-[#7928CA] text-white hover:bg-[#6a23b3]">Choose Standard</Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border rounded-lg p-8 text-center"
            >
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <p className="text-4xl font-bold mb-6">$24<span className="text-lg font-normal">/month</span></p>
              <ul className="text-left mb-8">
                <li className="mb-2 flex items-center"><CreditCardIcon className="h-5 w-5 text-purple-500 mr-2" /> 300 credits/month</li>
                <li className="mb-2 flex items-center"><DollarSignIcon className="h-5 w-5 text-purple-500 mr-2" /> Additional credits at $0.08 each</li>
              </ul>
              <Button onClick={onPremiumSubscribe} className="w-full bg-[#7928CA] text-white hover:bg-[#6a23b3]">Choose Premium</Button>
            </motion.div>
          </div>
        </div>
        {referral && <input type="hidden" name="referral" value={referral} />}
      </section> */}

      {/* Add */}
      {/* <section className="bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12">Need More Credits?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Small Pack</CardTitle>
                <CardDescription>20 Credits | $2.40 | $0.12 per credit</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => createCreditCheckoutSession('small')}>Buy Now</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Medium Pack</CardTitle>
                <CardDescription>50 Credits | $5.00 | $0.10 per credit</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => createCreditCheckoutSession('medium')}>Buy Now</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Large Pack</CardTitle>
                <CardDescription>100 Credits | $8.00 | $0.08 per credit</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => createCreditCheckoutSession('large')}>Buy Now</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Final CTA - Optimized */}
      <section className="bg-gradient-to-r from-[#7928CA] to-[#FF0080] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-6">
            Ready to Transform Your Stream?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of streamers and communities already using EmoteMaker.ai to engage their audience with unique, custom emotes.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleStartCreating} className="bg-white text-[#7928CA] hover:bg-gray-100 text-lg" size="lg">
              Start Creating Your Emotes Now
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}