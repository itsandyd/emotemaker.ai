'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { HexColorPicker } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface TextEmojiGeneratorProps {
  setImage: (image: string) => void
}

const fontOptions = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier',
  'Verdana',
  'Georgia',
  'Palatino',
  'Garamond',
  'Bookman',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Impact'
]

export default function TextEmojiGenerator({ setImage }: TextEmojiGeneratorProps) {
  const [text, setText] = useState('')
  const [font, setFont] = useState(fontOptions[0])
  const [fontSize, setFontSize] = useState(48)
  const [textColor, setTextColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [backgroundOpacity, setBackgroundOpacity] = useState(100)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const MemoizedTextColorPicker = useMemo(() => (
    <HexColorPicker color={textColor} onChange={setTextColor} />
  ), [textColor, setTextColor])

  const MemoizedBackgroundColorPicker = useMemo(() => (
    <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
  ), [backgroundColor, setBackgroundColor])

  useEffect(() => {
    renderEmoji()
  }, [text, font, fontSize, textColor, backgroundColor, backgroundOpacity])

  const renderEmoji = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = `${backgroundColor}${Math.round(backgroundOpacity * 2.55).toString(16).padStart(2, '0')}`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw text
    ctx.fillStyle = textColor
    ctx.font = `${fontSize}px ${font}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  }

  const handleGenerate = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const image = canvas.toDataURL('image/png')
      setImage(image)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="text-input">Text</Label>
          <Input
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter emoji text"
            maxLength={5}
          />
        </div>
        <div>
          <Label htmlFor="font-select">Font</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger id="font-select">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="font-size-slider">Font Size</Label>
          <Slider
            id="font-size-slider"
            min={12}
            max={72}
            step={1}
            value={[fontSize]}
            onValueChange={(value) => setFontSize(value[0])}
          />
          <span className="text-sm text-gray-500">{fontSize}px</span>
        </div>
        <div>
          <Label>Text Color</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: textColor }} />
                <span>{textColor}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {MemoizedTextColorPicker}
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>Background Color</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: backgroundColor }} />
                <span>{backgroundColor}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {MemoizedBackgroundColorPicker}
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="bg-opacity-slider">Background Opacity</Label>
          <Slider
            id="bg-opacity-slider"
            min={0}
            max={100}
            step={1}
            value={[backgroundOpacity]}
            onValueChange={(value) => setBackgroundOpacity(value[0])}
          />
          <span className="text-sm text-gray-500">{backgroundOpacity}%</span>
        </div>
      </div>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={128}
          height={128}
          className="border border-gray-300 rounded-lg"
        />
      </div>
      <Button onClick={handleGenerate} className="w-full">Generate Emoji</Button>
    </div>
  )
}

