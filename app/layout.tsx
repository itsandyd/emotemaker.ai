import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { auth, currentUser } from '@clerk/nextjs/server'
import Navbar from '@/components/Navbar'
import { getApiLimitCount } from '@/lib/api-limit'
import { ModalProvider } from '@/components/ModalProvider'
import { ToasterProvider } from '@/components/ToasterProvider'
import { checkSubscription } from '../lib/subscription'
import { TooltipProvider } from '@/components/ui/tooltip'
import Script from 'next/script'
import { Toaster } from "@/components/ui/sonner"

import { getUser } from '@/actions/get-user'
import { getUserCredits } from '@/actions/get-user-credits'
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EmoteMaker.ai - Create Custom Emotes for Twitch and Discord',
  description: 'Turn your ideas into stunning emotes with AI. Perfect for Twitch Streamers, Discord Moderators, and content creators. Create, customize, and download high-quality emotes instantly.',
  keywords: ['emote maker', 'Twitch emotes', 'Discord emotes', 'AI emote generator', 'custom emotes', 'streamer tools'],
  authors: [{ name: 'EmoteMaker.ai Team' }],
  creator: 'EmoteMaker.ai',
  publisher: 'EmoteMaker.ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'EmoteMaker.ai - AI-Powered Custom Emote Creator',
    description: 'Create unique, eye-catching emotes for your Twitch and Discord channels using advanced AI technology.',
    url: 'https://emotemaker.ai',
    siteName: 'EmoteMaker.ai',
    images: [
      {
        url: 'https://emotemaker.ai/og-image.png', // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: 'EmoteMaker.ai - Custom Emote Creator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EmoteMaker.ai - Create Custom Emotes with AI',
    description: 'Design unique emotes for Twitch and Discord using AI. Stand out with personalized, high-quality emotes.',
    images: ['https://emotemaker.ai/twitter-image.png'], // Replace with your actual Twitter card image URL
    creator: '@EmoteMakerAI', // Replace with your actual Twitter handle
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  category: 'Technology',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()
  const apiLimitCount = await getApiLimitCount()
  const isPro = await checkSubscription(userId)
  const credits = await getUserCredits()

  let user = null;
  if (userId) {
    try {
      const clerkUser = await currentUser();
      user = await getUser({ 
        userId,
        name: clerkUser?.firstName || clerkUser?.username || 'Anonymous',
        email: clerkUser?.emailAddresses[0]?.emailAddress
      });
    } catch (error) {
      console.error("Failed to initialize user:", error);
    }
  }

  const hasActiveSubscription = await checkSubscription(userId);

  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <head>
          <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet" />
        </head>
        <body className={`${inter.className} h-full`}>
            <Navbar isPro={isPro} apiLimitCount={apiLimitCount} credits={credits} hasActiveSubscription={hasActiveSubscription} />
            <ToasterProvider />
            <Toaster />
            <TooltipProvider>
              <ModalProvider />
              {children}
              <Analytics />
              <Script async src="//cdn.trackdesk.com/tracking.js" />
              <Script
                id="trackdesk-script"
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(t,d,k){(t[k]=t[k]||[]).push(d);t[d]=t[d]||t[k].f||function(){(t[d].q=t[d].q||[]).push(arguments)}})(window,"trackdesk","TrackdeskObject");
                    trackdesk("emotemaker", "click");
                  `,
                }}
              />
              <Script src="https://r.wdfl.co/rw.js" data-rewardful="80664d" />
              <Script id="rewardful-queue">
                {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
              </Script>
            </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
