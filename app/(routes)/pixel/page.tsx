import PixelLanding from '@/components/landing/PixelLanding'
import { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Pixel Emotes - EmoteMaker.ai',
  description: 'Create retro-style pixel art emotes with AI for your Twitch and Discord communities.',
  keywords: ['Pixel Art', 'Retro', '8-bit', 'Emotes', 'AI', 'Twitch', 'Discord', 'Streaming'],
  authors: [{ name: 'EmoteMaker.ai Team' }],
  creator: 'EmoteMaker.ai',
  publisher: 'EmoteMaker.ai',
  openGraph: {
    title: 'Pixel Emotes - EmoteMaker.ai',
    description: 'Create retro-style pixel art emotes with AI for your Twitch and Discord communities.',
    url: 'https://emotemaker.ai/pixel',
    siteName: 'EmoteMaker.ai',
    images: [
      {
        url: '/beboppixel.png',
        width: 800,
        height: 800,
        alt: 'Retro Space Alien Pixel Art by EmoteMaker.ai',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixel Emotes - EmoteMaker.ai',
    description: 'Create retro-style pixel art emotes with AI for your Twitch and Discord communities.',
    creator: '@EmoteMakerAI',
    images: ['/beboppixel.png'],
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

export default function PixelPage() {
  return <PixelLanding />
} 