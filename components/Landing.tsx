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


import { HeroSection } from "@/components/sections/HeroSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";

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

  // Implement smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: (targetElement as HTMLElement).offsetTop - 80, // Adjust for header height
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-white"
    >
      <HeroSection />
      <ProcessSection />
      <FeaturesSection />
      {/* <GallerySection /> */}
      <TestimonialsSection />
      <CTASection />
    </motion.div>
  )
}