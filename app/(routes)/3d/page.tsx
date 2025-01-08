import ThreeDLanding from '@/components/landing/ThreeDLanding'
import { Metadata } from 'next'


export const metadata: Metadata = {
  title: '3D Emotes - EmoteMaker.ai',
  description: 'Create stunning 3D-style emotes with AI for your Twitch and Discord communities.',
  keywords: ['3D', 'Gaming', 'Alien', 'Emotes', 'AI', 'Twitch', 'Discord', 'Streaming'],
  authors: [{ name: 'EmoteMaker.ai Team' }],
  creator: 'EmoteMaker.ai',
  publisher: 'EmoteMaker.ai',
  openGraph: {
    title: '3D Emotes - EmoteMaker.ai',
    description: 'Create stunning 3D-style emotes with AI for your Twitch and Discord communities.',
    url: 'https://emotemaker.ai/3d',
    siteName: 'EmoteMaker.ai',
    images: [
      {
        url: '/alien3d.png',
        width: 800,
        height: 800,
        alt: 'Cool 3D Alien Gamer Emote by EmoteMaker.ai',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3D Emotes - EmoteMaker.ai',
    description: 'Create stunning 3D-style emotes with AI for your Twitch and Discord communities.',
    creator: '@EmoteMakerAI',
    images: ['/alien3d.png'],
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

export default function ThreeDPage() {
  return <ThreeDLanding />
} 