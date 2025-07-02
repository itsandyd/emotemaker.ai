'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, RefreshCw, Share2 } from 'lucide-react'
import { createAnimatedGif } from '@/lib/beta/utils /imageProcessing'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DownloadEmojiProps {
  image: string
  onStartOver: () => void
  animation?: {
    type: 'none' | 'shake' | 'spin' | 'bounce' | 'zoom' | 'slide' | 'flip' | 'pet'
    speed: number
    handX?: number
    handY?: number
    patDistance?: number
  }
}

export default function DownloadEmoji({ image, onStartOver, animation }: DownloadEmojiProps) {
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg' | 'gif'>('png')
  const [svgData, setSvgData] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Clear SVG data when switching to GIF format
  useEffect(() => {
    if (downloadFormat === 'gif') {
      setSvgData(null)
    }
  }, [downloadFormat])

  // Add animation styles
  useEffect(() => {
    if (!animation || animation.type === 'none') return

    const styleTag = document.createElement('style')
    const { handX = 50, handY = 0, patDistance = 60 } = animation
    
    const keyframes = {
      pet: `
        @keyframes preview-pet-hand {
          0% { transform: translate(calc(-50% + ${handX - 50}px), calc(-${patDistance + 60}% + ${handY}px)) rotate(0deg); }
          45% { transform: translate(calc(-50% + ${handX - 50}px), calc(-60% + ${handY}px)) rotate(0deg); }
          55% { transform: translate(calc(-50% + ${handX - 50}px), calc(-60% + ${handY}px)) rotate(0deg); }
          100% { transform: translate(calc(-50% + ${handX - 50}px), calc(-${patDistance + 60}% + ${handY}px)) rotate(0deg); }
        }`,
      shake: `@keyframes preview-shake {
        0%, 100% { transform: translate(-50%, -50%) translateX(0); }
        25% { transform: translate(-50%, -50%) translateX(-5px); }
        75% { transform: translate(-50%, -50%) translateX(5px); }
      }`,
      spin: `@keyframes preview-spin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }`,
      bounce: `@keyframes preview-bounce {
        0%, 100% { transform: translate(-50%, -50%) translateY(0); }
        50% { transform: translate(-50%, -50%) translateY(-10px); }
      }`,
      zoom: `@keyframes preview-zoom {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.2); }
      }`,
      slide: `@keyframes preview-slide {
        0% { transform: translate(-50%, -50%) translateX(-20px); }
        100% { transform: translate(-50%, -50%) translateX(20px); }
      }`,
      flip: `@keyframes preview-flip {
        0% { transform: translate(-50%, -50%) perspective(400px) rotateY(0); }
        100% { transform: translate(-50%, -50%) perspective(400px) rotateY(360deg); }
      }`
    }

    styleTag.textContent = keyframes[animation.type]
    document.head.appendChild(styleTag)
    return () => {
      document.head.removeChild(styleTag)
    }
  }, [animation])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const convertToSVG = (canvas: HTMLCanvasElement) => {
      if (!animation || animation.type === 'none') {
        const svgNS = "http://www.w3.org/2000/svg"
        const svg = document.createElementNS(svgNS, "svg")
        svg.setAttribute("width", "128")
        svg.setAttribute("height", "128")
        svg.setAttribute("viewBox", "0 0 128 128")
        
        const image = document.createElementNS(svgNS, "image")
        image.setAttribute("width", "128")
        image.setAttribute("height", "128")
        image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", canvas.toDataURL())
        
        svg.appendChild(image)
        setSvgData(new XMLSerializer().serializeToString(svg))
        return
      }

      const svgNS = "http://www.w3.org/2000/svg"
      const svg = document.createElementNS(svgNS, "svg")
      svg.setAttribute("width", "128")
      svg.setAttribute("height", "128")
      svg.setAttribute("viewBox", "0 0 128 128")
      
      // Add animation styles
      const style = document.createElementNS(svgNS, "style")
      const keyframes = {
        pet: `@keyframes svg-pet {
          0%, 100% { transform: translate(-50%, -50%); }
        }`,
        shake: `@keyframes svg-shake {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          25% { transform: translate(-50%, -50%) translateX(-5px); }
          75% { transform: translate(-50%, -50%) translateX(5px); }
        }`,
        spin: `@keyframes svg-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }`,
        bounce: `@keyframes svg-bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }`,
        zoom: `@keyframes svg-zoom {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }`,
        slide: `@keyframes svg-slide {
          0% { transform: translate(-50%, -50%) translateX(-20px); }
          100% { transform: translate(-50%, -50%) translateX(20px); }
        }`,
        flip: `@keyframes svg-flip {
          0% { transform: translate(-50%, -50%) perspective(400px) rotateY(0); }
          100% { transform: translate(-50%, -50%) perspective(400px) rotateY(360deg); }
        }`
      }
      style.textContent = keyframes[animation.type]
      svg.appendChild(style)
      
      const baseImage = document.createElementNS(svgNS, "image")
      baseImage.setAttribute("width", "128")
      baseImage.setAttribute("height", "128")
      baseImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", canvas.toDataURL())
      baseImage.setAttribute("style", `animation: svg-${animation.type} ${2 / animation.speed}s infinite;`)
      
      svg.appendChild(baseImage)
      setSvgData(new XMLSerializer().serializeToString(svg))
    }

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // For GIF format, only draw the base image
      if (downloadFormat === 'gif' && animation?.type === 'pet') {
        ctx.drawImage(img, 0, 0, 128, 128)
      } else {
        // For other formats, draw both base image and hand if needed
        ctx.drawImage(img, 0, 0, 128, 128)
        if (animation?.type === 'pet') {
          const handImg = new Image()
          handImg.onload = () => {
            const { handX = 50, handY = 0 } = animation
            ctx.drawImage(
              handImg,
              64 + (handX - 50) - 24,
              64 - 60 + handY - 24,
              48,
              48
            )
            convertToSVG(canvas)
          }
          handImg.src = '/handpat.svg'
        } else {
          convertToSVG(canvas)
        }
      }
    }
    img.src = image
  }, [image, downloadFormat, animation])

  const handleDownload = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    let downloadUrl: string
    let fileName: string

    try {
      setIsGenerating(true)

      if (downloadFormat === 'png') {
        downloadUrl = canvas.toDataURL('image/png')
        fileName = 'custom-emoji.png'
      } else if (downloadFormat === 'gif' && animation && animation.type !== 'none') {
        const gifBlob = await createAnimatedGif(
          canvas,
          animation,
          animation.type === 'pet' ? '/handpat.svg' : undefined
        )
        downloadUrl = URL.createObjectURL(gifBlob)
        fileName = 'custom-emoji.gif'
      } else {
        if (!svgData) return
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        downloadUrl = URL.createObjectURL(blob)
        fileName = 'custom-emoji.svg'
      }

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      if (downloadFormat !== 'png') {
        URL.revokeObjectURL(downloadUrl)
      }
    } catch (error) {
      console.error('Error generating file:', error)
      alert('There was an error generating your file. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div ref={previewRef} className="w-[128px] h-[128px] border rounded-lg relative">
          <canvas ref={canvasRef} width={128} height={128} className="absolute top-1/2 left-1/2" style={{
            transform: 'translate(-50%, -50%)',
            animation: animation && animation.type !== 'none' && downloadFormat === 'gif'
              ? `preview-${animation.type} ${2 / animation.speed}s infinite`
              : undefined
          }} />
          {animation?.type === 'pet' && downloadFormat === 'gif' && (
            <img
              src="/handpat.svg"
              alt="Hand patting animation"
              className="absolute pointer-events-none"
              style={{
                top: '50%',
                left: '50%',
                width: '48px',
                height: '48px',
                animation: `preview-pet-hand ${2 / animation.speed}s infinite`,
                zIndex: 2
              }}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Select value={downloadFormat} onValueChange={(value: 'png' | 'svg' | 'gif') => setDownloadFormat(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="svg">SVG (Animated)</SelectItem>
            {animation && animation.type !== 'none' && (
              <SelectItem value="gif">GIF</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleDownload} 
          className="w-full sm:w-auto"
          disabled={isGenerating}
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : `Download ${downloadFormat.toUpperCase()}`}
        </Button>
        <Button onClick={onStartOver} variant="outline" className="w-full sm:w-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
      </div>
    </div>
  )
}

