import PepeLanding from '@/app/components/landing/PepeLanding'
import { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Pepe Emotes - EmoteMaker.ai',
  description: 'Create hilarious Pepe emotes with AI for your Twitch and Discord communities.',
  keywords: ['Pepe', 'Pepe the Frog', 'Emotes', 'AI', 'Twitch', 'Discord', 'Streaming'],
  authors: [{ name: 'EmoteMaker.ai Team' }],
  creator: 'EmoteMaker.ai',
  publisher: 'EmoteMaker.ai',
  openGraph: {
    title: 'Pepe Emotes - EmoteMaker.ai',
    description: 'Create hilarious Pepe emotes with AI for your Twitch and Discord communities.',
    url: 'https://emotemaker.ai/pepe',
    siteName: 'EmoteMaker.ai',
    images: [
      {
        url: '/pepefacesplash.jpg',
        width: 800,
        height: 800,
        alt: 'Pepe Face Splash Emote by EmoteMaker.ai',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pepe Emotes - EmoteMaker.ai',
    description: 'Create hilarious Pepe emotes with AI for your Twitch and Discord communities.',
    creator: '@EmoteMakerAI',
    images: ['/pepefacesplash.jpg'],
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

export default function PepePage() {
  return <PepeLanding />
} 