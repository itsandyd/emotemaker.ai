import { Metadata } from 'next'
import KawaiiLanding from "@/components/landing/KawaiiLanding"

export const metadata: Metadata = {
  title: 'Kawaii Emotes - EmoteMaker.ai',
  description: 'Create adorable Kawaii-style emotes with AI for your Twitch and Discord communities.',
  keywords: ['Kawaii', 'Cute', 'Anime', 'Emotes', 'AI', 'Twitch', 'Discord', 'Streaming'],
  authors: [{ name: 'EmoteMaker.ai Team' }],
  creator: 'EmoteMaker.ai',
  publisher: 'EmoteMaker.ai',
  openGraph: {
    title: 'Kawaii Emotes - EmoteMaker.ai',
    description: 'Create adorable Kawaii-style emotes with AI for your Twitch and Discord communities.',
    url: 'https://emotemaker.ai/kawaii',
    siteName: 'EmoteMaker.ai',
    images: [
      {
        url: '/kawaiigirl.png',
        width: 800,
        height: 800,
        alt: 'Adorable Kawaii Girl Emote by EmoteMaker.ai',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kawaii Emotes - EmoteMaker.ai',
    description: 'Create adorable Kawaii-style emotes with AI for your Twitch and Discord communities.',
    creator: '@EmoteMakerAI',
    images: ['/kawaiigirl.png'],
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

export default function KawaiiPage() {
  return <KawaiiLanding />
}