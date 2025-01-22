'use client'

import { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ActiveTool, AnimationType, AnimationConfig } from "../types"
import { KonvaEditor } from "../types"
import { toast } from "sonner"

interface AnimationSidebarProps {
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
  editor: KonvaEditor | undefined
}

export const AnimationSidebar = ({ 
  activeTool, 
  onChangeActiveTool,
  editor 
}: AnimationSidebarProps) => {
  const [animationType, setAnimationType] = useState<AnimationType>('none')
  const [speed, setSpeed] = useState(1)
  const [handX, setHandX] = useState(50)
  const [handY, setHandY] = useState(0)
  const [patDistance, setPatDistance] = useState(60)

  // Update animation settings when selection changes
  useEffect(() => {
    if (!editor?.selectedNode) return;
    
    const animation = editor.getAnimation(editor.selectedNode);
    if (animation) {
      setAnimationType(animation.type);
      setSpeed(animation.speed);
      setHandX(animation.handX || 50);
      setHandY(animation.handY || 0);
      setPatDistance(animation.patDistance || 60);
    } else {
      setAnimationType('none');
      setSpeed(1);
      setHandX(50);
      setHandY(0);
      setPatDistance(60);
    }
  }, [editor?.selectedNode]);

  const updateAnimation = (updates: Partial<AnimationConfig>) => {
    if (!editor?.selectedNode) {
      toast.error("No object selected");
      return;
    }

    const currentAnimation = editor.getAnimation(editor.selectedNode);
    const newAnimation: AnimationConfig = {
      type: updates.type || currentAnimation?.type || 'none',
      speed: updates.speed || currentAnimation?.speed || 1,
      handX: updates.handX || currentAnimation?.handX,
      handY: updates.handY || currentAnimation?.handY,
      patDistance: updates.patDistance || currentAnimation?.patDistance,
    };

    if (newAnimation.type === 'none') {
      editor.setAnimation(editor.selectedNode, null);
    } else {
      editor.setAnimation(editor.selectedNode, newAnimation);
    }
  };

  if (activeTool !== "animate") {
    return null;
  }

  if (!editor?.selectedNode) {
    return (
      <div className="w-80 border-r bg-background flex flex-col gap-4 p-4">
        <p className="text-muted-foreground text-center">Select an object to animate</p>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <Label>Animation Type</Label>
        <Select 
          value={animationType} 
          onValueChange={(value) => {
            setAnimationType(value as AnimationType);
            updateAnimation({ type: value as AnimationType });
          }}
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

      {animationType !== 'none' && (
        <div>
          <Label>Animation Speed</Label>
          <Slider
            value={[speed]}
            onValueChange={([value]) => {
              setSpeed(value);
              updateAnimation({ speed: value });
            }}
            min={0.5}
            max={3}
            step={0.1}
          />
          <span className="text-sm text-gray-500">{speed.toFixed(1)}x</span>
        </div>
      )}

      {animationType === 'pet' && (
        <>
          <div>
            <Label>Hand Position X</Label>
            <Slider
              value={[handX]}
              onValueChange={([value]) => {
                setHandX(value);
                updateAnimation({ handX: value });
              }}
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
              onValueChange={([value]) => {
                setHandY(value);
                updateAnimation({ handY: value });
              }}
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
              onValueChange={([value]) => {
                setPatDistance(value);
                updateAnimation({ patDistance: value });
              }}
              min={20}
              max={100}
              step={1}
            />
            <span className="text-sm text-gray-500">{patDistance}%</span>
          </div>
        </>
      )}
    </div>
  );
} 