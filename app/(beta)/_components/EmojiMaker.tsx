'use client'

import React, { useState, lazy, Suspense } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import EmojiGallery from './EmojiGallery'
import ImageUpload from './ImageUpload'
import TextEmojiGenerator from './TextEmojiGenerator'
import ImageEditor from './ImageEditor'
import DownloadEmoji from './DownloadEmoji'

export default function EmojiMaker() {
  const [image, setImage] = useState<string | null>(null)
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [animation, setAnimation] = useState<{
    type: 'none' | 'shake' | 'spin' | 'bounce' | 'zoom' | 'slide' | 'flip' | 'pet'
    speed: number
    handX?: number
    handY?: number
    patDistance?: number
  }>({
    type: 'none',
    speed: 1
  })

  const handleImageUpload = (uploadedImage: string) => {
    setImage(uploadedImage)
    setEditedImage(null) // Reset edited image when new image is uploaded
    setAnimation({ type: 'none', speed: 1 }) // Reset animation
  }

  const handleStartOver = () => {
    setImage(null)
    setEditedImage(null)
    setAnimation({ type: 'none', speed: 1 })
  }

  const handleSaveEmoji = () => {
    if (editedImage) {
      const savedEmojis = JSON.parse(localStorage.getItem('savedEmojis') || '[]')
      const newEmoji = {
        id: uuidv4(),
        dataUrl: editedImage,
        animation: animation.type !== 'none' ? animation : undefined
      }
      savedEmojis.push(newEmoji)
      localStorage.setItem('savedEmojis', JSON.stringify(savedEmojis))
    }
  }

  const handleSelectEmoji = (emojiDataUrl: string, savedAnimation?: typeof animation) => {
    setImage(emojiDataUrl)
    setEditedImage(null)
    setAnimation(savedAnimation || { type: 'none', speed: 1 })
  }

  return (
    <div className="space-y-8 max-w-md mx-auto">
      <EmojiGallery onSelectEmoji={handleSelectEmoji} />
      {!image && (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="text">Create Text Emoji</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <ImageUpload setImage={handleImageUpload} />
          </TabsContent>
          <TabsContent value="text">
            <TextEmojiGenerator setImage={handleImageUpload} />
          </TabsContent>
        </Tabs>
      )}
      {image && !editedImage && (
        <ImageEditor 
          image={image} 
          setEditedImage={setEditedImage}
          animation={animation}
          setAnimation={setAnimation}
        />
      )}
      {editedImage && (
        <div className="space-y-4">
          <Button onClick={handleSaveEmoji} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save to Gallery
          </Button>
          <DownloadEmoji 
            image={editedImage} 
            onStartOver={handleStartOver}
            animation={animation.type !== 'none' ? animation : undefined}
          />
        </div>
      )}
    </div>
  )
}

