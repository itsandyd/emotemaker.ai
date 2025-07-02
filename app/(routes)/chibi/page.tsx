import { Metadata } from 'next'
import ChibiLanding from "@/components/landing/ChibiLanding"

export const metadata: Metadata = {
  title: 'Chibi Emotes - EmoteMaker.ai',
  description: 'Create adorable Chibi emotes with AI for your Twitch and Discord communities.',
  keywords: ['Chibi', 'Emotes', 'AI', 'Twitch', 'Discord', 'Streaming'],
  authors: [{ name: 'EmoteMaker.ai Team' }],
  creator: 'EmoteMaker.ai',
  publisher: 'EmoteMaker.ai',
  openGraph: {
    title: 'Chibi Emotes - EmoteMaker.ai',
    description: 'Create adorable Chibi emotes with AI for your Twitch and Discord communities.',
    url: 'https://emotemaker.ai/chibi',
    siteName: 'EmoteMaker.ai',
    images: [
      {
        url: '/andrewchibi.jpeg',
        width: 800,
        height: 800,
        alt: 'Cool Chibi with Sunglasses by EmoteMaker.ai',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chibi Emotes - EmoteMaker.ai',
    description: 'Create adorable Chibi emotes with AI for your Twitch and Discord communities.',
    creator: '@EmoteMakerAI',
    images: ['/andrewchibi.jpeg'],
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
}

export default function ChibiPage() {
  return <ChibiLanding />
}