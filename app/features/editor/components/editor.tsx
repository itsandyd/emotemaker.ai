"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useEditor } from "../hooks/use-editor"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { Toolbar } from "./toolbar"
import { Footer } from "./footer"
import { ActiveTool, WorkspaceType } from "../types"
import { ShapeSidebar } from "./shape-sidebar"
import { Emote } from "@prisma/client"
import { FillColorSidebar } from "./fill-color-sidebar"
import { StrokeColorSidebar } from "./stroke-color-sidebar"
import { StrokeWidthSidebar } from "./stroke-width-sidebar"
import { OpacitySidebar } from "./opacity-sidebar"
import { TextSidebar } from "./text-sidebar"
import { FontSidebar } from "./font-sidebar"
import { EmoteSidebar } from "./emote-sidebar"
import { EmoteGeneratorSidebar } from "./generate-sidebar"
import { FilterSidebar } from "./filter-sidebar"
import { DrawSidebar } from "./draw-sidebar"
import { InpaintSidebar } from "./inpaint-sidebar"
import { VideoSidebar } from "./video-sidebar"
import { VideoControls } from './video-controls'
import { DEFAULT_WORKSPACE_CONFIGS } from "../types"

interface EditorProps {
  userId: string;
  emotes: Emote[];
  initialWorkspaceType?: WorkspaceType;
}

export const Editor = ({ 
  userId, 
  emotes: initialEmotes,
  initialWorkspaceType = 'image'
}: EditorProps) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("select")
  const [emotes, setEmotes] = useState<Emote[]>(initialEmotes)
  const [currentPrompt, setCurrentPrompt] = useState<string>("")
  const [isEditorReady, setIsEditorReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const onClearSelection = useCallback(() => {
    if (activeTool !== "draw" && activeTool !== "video-controls") {
      setActiveTool("select")
    }
  }, [activeTool])

  const { editor, init } = useEditor({
    clearSelectionCallback: onClearSelection
  })

  useEffect(() => {
    if (containerRef.current) {
      init(containerRef.current, initialWorkspaceType);
      setIsEditorReady(true);
    }
  }, [init, initialWorkspaceType])

  // Reset editor ready state when workspace type changes
  useEffect(() => {
    setIsEditorReady(false);
  }, [])

  const onChangeActiveTool = useCallback((tool: ActiveTool) => {
    if (tool === "draw") {
      editor?.enableDrawingMode()
    }

    if (activeTool === "draw") {
      editor?.disableDrawingMode()
    }
    
    if (tool === activeTool) {
      return setActiveTool("select")
    }

    setActiveTool(tool)
  }, [activeTool, editor])

  const addEmote = useCallback((newEmote: Emote) => {
    setEmotes(prevEmotes => [newEmote, ...prevEmotes])
  }, [])

  const config = DEFAULT_WORKSPACE_CONFIGS[initialWorkspaceType]

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
          workspaceType={initialWorkspaceType}
          editor={editor}
        />
        <ShapeSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FillColorSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeWidthSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TextSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FontSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
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
        <FilterSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <DrawSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <InpaintSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-200">
          <Toolbar 
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            addEmote={addEmote}
            currentPrompt={currentPrompt}
          />
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="relative" 
              ref={containerRef}
              style={{
                width: config.width,
                height: config.height,
                backgroundColor: config.backgroundColor
              }}
            >
              {editor?.stage && (
                <div className="absolute inset-0 pointer-events-none">
                  <VideoControls editor={editor} />
                </div>
              )}
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
