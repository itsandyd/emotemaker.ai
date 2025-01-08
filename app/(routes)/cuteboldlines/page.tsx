import CuteBoldLinesLanding from '@/components/landing/CuteBoldLinesLanding'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cute Bold Lines Emotes - EmoteMaker.ai',
  description: 'Create vibrant Cute Bold Lines emotes with AI for your Twitch and Discord communities.',
  keywords: ['Cute Bold Lines', 'Bold Style', 'Cartoon', 'Emotes', 'AI', 'Twitch', 'Discord', 'Streaming'],
  authors: [{ name: 'EmoteMaker.ai Team' }],
  creator: 'EmoteMaker.ai',
  publisher: 'EmoteMaker.ai',
  openGraph: {
    title: 'Cute Bold Lines Emotes - EmoteMaker.ai',
    description: 'Create vibrant Cute Bold Lines emotes with AI for your Twitch and Discord communities.',
    url: 'https://emotemaker.ai/cuteboldlines',
    siteName: 'EmoteMaker.ai',
    images: [
      {
        url: '/cblflamingo.png',
        width: 800,
        height: 800,
        alt: 'Cool Flamingo with Sunglasses by EmoteMaker.ai',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cute Bold Lines Emotes - EmoteMaker.ai',
    description: 'Create vibrant Cute Bold Lines emotes with AI for your Twitch and Discord communities.',
    creator: '@EmoteMakerAI',
    images: ['/cblflamingo.png'],
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

export default function CuteBoldLinesPage() {
  return <CuteBoldLinesLanding />
}