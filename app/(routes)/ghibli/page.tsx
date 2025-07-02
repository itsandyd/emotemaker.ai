import GhibliLanding from '@/components/landing/GhibliLanding'
import { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Ghibli Emotes - EmoteMaker.ai',
  description: 'Create magical Ghibli-style emotes with AI for your Twitch and Discord communities.',
  keywords: ['Ghibli', 'Studio Ghibli', 'Anime', 'Emotes', 'AI', 'Twitch', 'Discord', 'Streaming'],
  authors: [{ name: 'EmoteMaker.ai Team' }],
  creator: 'EmoteMaker.ai',
  publisher: 'EmoteMaker.ai',
  openGraph: {
    title: 'Ghibli Emotes - EmoteMaker.ai',
    description: 'Create magical Ghibli-style emotes with AI for your Twitch and Discord communities.',
    url: 'https://emotemaker.ai/ghibli',
    siteName: 'EmoteMaker.ai',
    images: [
      {
        url: '/femaleghibi.png',
        width: 800,
        height: 800,
        alt: 'Ghibli-Style Character by EmoteMaker.ai',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ghibli Emotes - EmoteMaker.ai',
    description: 'Create magical Ghibli-style emotes with AI for your Twitch and Discord communities.',
    creator: '@EmoteMakerAI',
    images: ['/femaleghibi.png'],
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

export default function GhibliPage() {
  return <GhibliLanding />
} 