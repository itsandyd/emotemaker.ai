'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Crop } from 'react-image-crop'
import { HexColorPicker } from 'react-colorful'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ImageEditorProps {
  image: string
  setEditedImage: (image: string) => void
  animation: {
    type: 'none' | 'shake' | 'spin' | 'bounce' | 'zoom' | 'slide' | 'flip' | 'pet'
    speed: number
    handX?: number
    handY?: number
    patDistance?: number
  }
  setAnimation: (animation: {
    type: 'none' | 'shake' | 'spin' | 'bounce' | 'zoom' | 'slide' | 'flip' | 'pet'
    speed: number
    handX?: number
    handY?: number
    patDistance?: number
  }) => void
}

export default function ImageEditor({ image, setEditedImage, animation, setAnimation }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>()
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [roundedCorners, setRoundedCorners] = useState(0)
  const [colorOverlay, setColorOverlay] = useState('#ffffff')
  const [colorOverlayOpacity, setColorOverlayOpacity] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [handImage] = useState<string>('/handpat.svg')
  const animationFrameRef = useRef<number>()

  // Remove local animation states since they're now passed as props
  const { type: animationType, speed: animationSpeed, handX = 50, handY = 0, patDistance = 60 } = animation

  // Update the animation keyframes to use the props
  const animations = {
    none: '',
    pet: `
      @keyframes pet-hand {
        0% { transform: translate(calc(-50% + ${handX - 50}px), calc(-${patDistance + 60}% + ${handY}px)) rotate(0deg); }
        45% { transform: translate(calc(-50% + ${handX - 50}px), calc(-60% + ${handY}px)) rotate(0deg); }
        55% { transform: translate(calc(-50% + ${handX - 50}px), calc(-60% + ${handY}px)) rotate(0deg); }
        100% { transform: translate(calc(-50% + ${handX - 50}px), calc(-${patDistance + 60}% + ${handY}px)) rotate(0deg); }
      }`,
    shake: `@keyframes shake {
      0%, 100% { transform: translate(-50%, -50%) translateX(0); }
      25% { transform: translate(-50%, -50%) translateX(-5px); }
      75% { transform: translate(-50%, -50%) translateX(5px); }
    }`,
    spin: `@keyframes spin {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }`,
    bounce: `@keyframes bounce {
      0%, 100% { transform: translate(-50%, -50%) translateY(0); }
      50% { transform: translate(-50%, -50%) translateY(-10px); }
    }`,
    zoom: `@keyframes zoom {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.2); }
    }`,
    slide: `@keyframes slide {
      0% { transform: translate(-50%, -50%) translateX(-20px); }
      100% { transform: translate(-50%, -50%) translateX(20px); }
    }`,
    flip: `@keyframes flip {
      0% { transform: translate(-50%, -50%) perspective(400px) rotateY(0); }
      100% { transform: translate(-50%, -50%) perspective(400px) rotateY(360deg); }
    }`
  }

  // Add style tag for animations
  useEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.textContent = Object.values(animations).join('\n')
    document.head.appendChild(styleTag)
    return () => {
      document.head.removeChild(styleTag)
    }
  }, [animations, handX, handY, patDistance])

  const updatePreview = useCallback(() => {
    if (!imgRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 128;
    tempCanvas.height = 128;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Calculate dimensions to maintain aspect ratio
    const img = imgRef.current;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    let drawWidth = tempCanvas.width;
    let drawHeight = tempCanvas.height;
    
    if (aspectRatio > 1) {
      drawHeight = drawWidth / aspectRatio;
    } else {
      drawWidth = drawHeight * aspectRatio;
    }

    // Center the image
    const x = (tempCanvas.width - drawWidth) / 2;
    const y = (tempCanvas.height - drawHeight) / 2;

    tempCtx.save();
    // Move to center, perform transforms, then move back
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((rotation * Math.PI) / 180);
    tempCtx.scale(scale, scale);
    tempCtx.translate(-tempCanvas.width / 2, -tempCanvas.height / 2);

    // Draw the image centered
    tempCtx.drawImage(img, x, y, drawWidth, drawHeight);
    tempCtx.restore();

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        data[i + j] = ((data[i + j] / 255 - 0.5) * (contrast / 100) + 0.5) * 255 * (brightness / 100);
      }
    }

    tempCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);

    if (roundedCorners > 0) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.moveTo(roundedCorners, 0);
      ctx.lineTo(canvas.width - roundedCorners, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, roundedCorners);
      ctx.lineTo(canvas.width, canvas.height - roundedCorners);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - roundedCorners, canvas.height);
      ctx.lineTo(roundedCorners, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - roundedCorners);
      ctx.lineTo(0, roundedCorners);
      ctx.quadraticCurveTo(0, 0, roundedCorners, 0);
      ctx.closePath();
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    if (colorOverlayOpacity > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = colorOverlay;
      ctx.globalAlpha = colorOverlayOpacity / 100;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  }, [image, scale, rotation, brightness, contrast, roundedCorners, colorOverlay, colorOverlayOpacity]);

  // Apply animation to preview
  useEffect(() => {
    if (!previewCanvasRef.current) return;
    updatePreview();
  }, [animation, animationSpeed, updatePreview]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (imgRef.current) {
        imgRef.current.src = image;
        updatePreview();
      }
    };
    img.src = image;
  }, [image, updatePreview]);

  const applyChanges = useCallback(() => {
    if (!previewCanvasRef.current) return;

    // Create a temporary canvas to capture the current state with animations
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 128;
    tempCanvas.height = 128;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw the current preview canvas state
    tempCtx.drawImage(previewCanvasRef.current, 0, 0);

    // If it's a pet animation, draw the hand
    if (animation.type === 'pet') {
      const handImg = new Image();
      handImg.onload = () => {
        const handX = (animation.handX || 50) - 50;
        const handY = -60 + (animation.handY || 0);
        tempCtx.drawImage(
          handImg,
          64 + handX - 24,
          64 + handY - 24,
          48,
          48
        );
        const dataUrl = tempCanvas.toDataURL('image/png');
        setEditedImage(dataUrl);
      };
      handImg.src = handImage;
    } else {
      const dataUrl = tempCanvas.toDataURL('image/png');
      setEditedImage(dataUrl);
    }
  }, [setEditedImage, animation, handImage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <img ref={imgRef} src={image} style={{ maxWidth: '100%' }} />
        </div>
        <div className="flex-1">
          <Label>Preview</Label>
          <div className="w-[128px] h-[128px] border relative">
            {animation.type === 'pet' && (
              <img
                src={handImage}
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  width: '48px',
                  height: '48px',
                  animation: `pet-hand ${2 / animation.speed}s infinite`,
                  zIndex: 2
                }}
              />
            )}
            <canvas 
              ref={previewCanvasRef} 
              width={128} 
              height={128} 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: animation.type !== 'none' && animation.type !== 'pet'
                  ? `${animation.type} ${2 / animation.speed}s infinite`
                  : undefined
              }}
            />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Scale</Label>
          <Slider
            value={[scale]}
            onValueChange={(value) => setScale(value[0])}
            min={0.5}
            max={2}
            step={0.1}
          />
          <span className="text-sm text-gray-500">{scale.toFixed(1)}x</span>
        </div>
        <div>
          <Label>Rotation</Label>
          <Slider
            value={[rotation]}
            onValueChange={(value) => setRotation(value[0])}
            min={0}
            max={360}
            step={1}
          />
          <span className="text-sm text-gray-500">{rotation}°</span>
        </div>
        <div>
          <Label>Brightness</Label>
          <Slider
            value={[brightness]}
            onValueChange={(value) => setBrightness(value[0])}
            min={0}
            max={200}
            step={1}
          />
          <span className="text-sm text-gray-500">{brightness}%</span>
        </div>
        <div>
          <Label>Contrast</Label>
          <Slider
            value={[contrast]}
            onValueChange={(value) => setContrast(value[0])}
            min={0}
            max={200}
            step={1}
          />
          <span className="text-sm text-gray-500">{contrast}%</span>
        </div>
        <div>
          <Label>Rounded Corners</Label>
          <Slider
            value={[roundedCorners]}
            onValueChange={(value) => setRoundedCorners(value[0])}
            min={0}
            max={64}
            step={1}
          />
          <span className="text-sm text-gray-500">{roundedCorners}px</span>
        </div>
        <div>
          <Label>Color Overlay</Label>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[120px] justify-start text-left font-normal">
                  <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: colorOverlay }} />
                  {colorOverlay}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <HexColorPicker color={colorOverlay} onChange={setColorOverlay} />
              </PopoverContent>
            </Popover>
            <Slider
              value={[colorOverlayOpacity]}
              onValueChange={(value) => setColorOverlayOpacity(value[0])}
              min={0}
              max={100}
              step={1}
            />
            <span className="text-sm text-gray-500">{colorOverlayOpacity}%</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Animation</Label>
          <Select 
            value={animation.type} 
            onValueChange={(value) => setAnimation({ ...animation, type: value as typeof animation.type })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select animation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="pet">Pet</SelectItem>
              <SelectItem value="shake">Shake</SelectItem>
              <SelectItem value="spin">Spin</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="flip">Flip</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {animation.type === 'pet' && (
          <>
            <div>
              <Label>Hand Position X</Label>
              <Slider
                value={[handX]}
                onValueChange={(value) => setAnimation({ ...animation, handX: value[0] })}
                min={0}
                max={100}
                step={1}
              />
              <span className="text-sm text-gray-500">{handX}%</span>
            </div>
            <div>
              <Label>Hand Position Y</Label>
              <Slider
                value={[handY]}
                onValueChange={(value) => setAnimation({ ...animation, handY: value[0] })}
                min={-20}
                max={20}
                step={1}
              />
              <span className="text-sm text-gray-500">{handY}%</span>
            </div>
            <div>
              <Label>Pat Distance</Label>
              <Slider
                value={[patDistance]}
                onValueChange={(value) => setAnimation({ ...animation, patDistance: value[0] })}
                min={20}
                max={100}
                step={1}
              />
              <span className="text-sm text-gray-500">{patDistance}%</span>
            </div>
          </>
        )}

        {animation.type !== 'none' && (
          <div>
            <Label>Animation Speed</Label>
            <Slider
              value={[animationSpeed]}
              onValueChange={(value) => setAnimation({ ...animation, speed: value[0] })}
              min={0.5}
              max={3}
              step={0.1}
            />
            <span className="text-sm text-gray-500">{animationSpeed.toFixed(1)}x</span>
          </div>
        )}
      </div>
      <Button onClick={applyChanges} className="w-full">Apply Changes</Button>
    </div>
  )
}

