'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2 } from 'lucide-react'

interface EmojiGalleryProps {
  onSelectEmoji: (dataUrl: string, animation?: {
    type: 'none' | 'shake' | 'spin' | 'bounce' | 'zoom' | 'slide' | 'flip' | 'pet'
    speed: number
    handX?: number
    handY?: number
    patDistance?: number
  }) => void
}

export default function EmojiGallery({ onSelectEmoji }: EmojiGalleryProps) {
  const [savedEmojis, setSavedEmojis] = useState<Array<{
    id: string
    dataUrl: string
    animation?: {
      type: 'none' | 'shake' | 'spin' | 'bounce' | 'zoom' | 'slide' | 'flip' | 'pet'
      speed: number
      handX?: number
      handY?: number
      patDistance?: number
    }
  }>>([])

  useEffect(() => {
    const styleTag = document.createElement('style')
    const animations = savedEmojis
      .filter(emoji => emoji.animation?.type === 'pet')
      .map(emoji => {
        const { handX = 50, handY = 0, patDistance = 60 } = emoji.animation!
        return `
          @keyframes pet-hand-${emoji.id} {
            0% { transform: translate(calc(-50% + ${handX - 50}px), calc(-${patDistance + 60}% + ${handY}px)) rotate(0deg); }
            45% { transform: translate(calc(-50% + ${handX - 50}px), calc(-60% + ${handY}px)) rotate(0deg); }
            55% { transform: translate(calc(-50% + ${handX - 50}px), calc(-60% + ${handY}px)) rotate(0deg); }
            100% { transform: translate(calc(-50% + ${handX - 50}px), calc(-${patDistance + 60}% + ${handY}px)) rotate(0deg); }
          }
        `
      }).join('\n')

    styleTag.textContent = animations
    document.head.appendChild(styleTag)
    return () => {
      document.head.removeChild(styleTag)
    }
  }, [savedEmojis])

  useEffect(() => {
    const emojis = JSON.parse(localStorage.getItem('savedEmojis') || '[]')
    setSavedEmojis(emojis)
  }, [])

  if (savedEmojis.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Saved Emojis</h2>
      <div className="grid grid-cols-4 gap-4">
        {savedEmojis.map((emoji) => (
          <div
            key={emoji.id}
            className="relative group cursor-pointer"
            onClick={() => onSelectEmoji(emoji.dataUrl, emoji.animation)}
          >
            <img
              src={emoji.dataUrl}
              alt="Saved emoji"
              className="w-16 h-16 rounded border hover:border-primary transition-colors"
              style={emoji.animation ? {
                animation: `${emoji.animation.type} ${2 / emoji.animation.speed}s infinite`
              } : undefined}
            />
            {emoji.animation?.type === 'pet' && (
              <img
                src="/handpat.svg"
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  width: '24px',
                  height: '24px',
                  animation: `pet-hand-${emoji.id} ${2 / emoji.animation.speed}s infinite`,
                  zIndex: 2
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

