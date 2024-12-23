"use client"

import { useEffect, useState } from "react";
import { ActiveTool, KonvaEditor } from "../types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { Emote } from "@prisma/client";

interface VideoSidebarProps {
  editor: KonvaEditor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  emotes: Emote[];
  setCurrentPrompt: (prompt: string) => void;
}

export const VideoSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool
}: VideoSidebarProps) => {
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  useEffect(() => {
    if (editor?.selectedNode && editor.isVideoObject(editor.selectedNode)) {
      const videoElement = editor.selectedNode.getAttr('videoElement') as HTMLVideoElement;
      setVolume(videoElement.volume);
      setPlaybackRate(videoElement.playbackRate);
      setBrightness(editor.selectedNode.getAttr('brightness') || 100);
      setContrast(editor.selectedNode.getAttr('contrast') || 100);
      setSaturation(editor.selectedNode.getAttr('saturation') || 100);
    }
  }, [editor?.selectedNode]);

  if (activeTool !== "video-controls" || !editor?.selectedNode || !editor.isVideoObject(editor.selectedNode)) {
    return null;
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col gap-4 p-4">
      <div>
        <Label>Volume</Label>
        <Slider
          value={[volume]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={([value]) => {
            setVolume(value);
            editor.setVolume(value);
          }}
        />
      </div>
      <div>
        <Label>Playback Speed</Label>
        <Slider
          value={[playbackRate]}
          min={0.5}
          max={2}
          step={0.1}
          onValueChange={([value]) => {
            setPlaybackRate(value);
            editor.setPlaybackRate(value);
          }}
        />
      </div>
      <div>
        <Label>Brightness</Label>
        <Slider
          value={[brightness]}
          min={0}
          max={200}
          step={1}
          onValueChange={([value]) => {
            setBrightness(value);
            editor.setBrightness(value);
          }}
        />
      </div>
      <div>
        <Label>Contrast</Label>
        <Slider
          value={[contrast]}
          min={0}
          max={200}
          step={1}
          onValueChange={([value]) => {
            setContrast(value);
            editor.setContrast(value);
          }}
        />
      </div>
      <div>
        <Label>Saturation</Label>
        <Slider
          value={[saturation]}
          min={0}
          max={200}
          step={1}
          onValueChange={([value]) => {
            setSaturation(value);
            editor.setSaturation(value);
          }}
        />
      </div>
    </div>
  );
};
