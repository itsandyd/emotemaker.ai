"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useEditor } from "../hooks/use-editor"
import { Stage, Layer } from "react-konva"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { Toolbar } from "./toolbar"
import { Footer } from "./footer"
import { VideoControls } from "./video-controls"
import { VideoSidebar } from "./video-sidebar"
import { EmoteGeneratorSidebar } from "./generate-sidebar"
import { EmoteSidebar } from "./emote-sidebar"
import { ActiveTool, WorkspaceType, KonvaEditor } from "../types"
import { DEFAULT_WORKSPACE_CONFIGS } from "../types"
import { Emote } from "@prisma/client"

interface VideoEditorProps {
  userId: string;
  emotes: Emote[];
  initialWorkspaceType?: WorkspaceType;
}

export const VideoEditor = ({ 
  userId,
  emotes: initialEmotes,
  initialWorkspaceType = 'video'
}: VideoEditorProps) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("select")
  const [emotes, setEmotes] = useState<Emote[]>(initialEmotes)
  const [currentPrompt, setCurrentPrompt] = useState<string>("")
  const [workspaceType] = useState<WorkspaceType>(initialWorkspaceType)
  const containerRef = useRef<HTMLDivElement>(null)

  const onClearSelection = useCallback(() => {
    if (activeTool !== "select") {
      setActiveTool("select")
    }
  }, [activeTool])

  const { editor, init } = useEditor({
    clearSelectionCallback: onClearSelection
  })

  const onChangeActiveTool = useCallback((tool: ActiveTool) => {
    if (tool === activeTool) {
      return setActiveTool("select")
    }

    setActiveTool(tool)
  }, [activeTool])

  useEffect(() => {
    if (containerRef.current) {
      init(containerRef.current, workspaceType)
    }
  }, [init, workspaceType])

  const addEmote = useCallback((newEmote: Emote) => {
    setEmotes(prevEmotes => [newEmote, ...prevEmotes])
  }, [])

  const config = DEFAULT_WORKSPACE_CONFIGS[workspaceType]

  return (
    <div className="flex flex-col h-full">
      <Navbar 
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          workspaceType={workspaceType}
          editor={editor}
        />
        <EmoteSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          emotes={emotes}
          setCurrentPrompt={setCurrentPrompt}
        />
        <VideoSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          emotes={emotes}
          setCurrentPrompt={setCurrentPrompt}
        />
        <EmoteGeneratorSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          emotes={emotes}
          addEmote={addEmote}
          currentPrompt={currentPrompt}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Toolbar 
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            addEmote={addEmote}
            currentPrompt={currentPrompt}
          />
          <div className="flex-1 relative bg-muted" ref={containerRef}>
            {editor?.stage && (
              <div className="absolute inset-0 pointer-events-none">
                <VideoControls editor={editor} />
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
} 