"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useEditor } from "../hooks/use-editor"

import { fabric } from "fabric"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { Toolbar } from "./toolbar"
import { Footer } from "./footer"
import { ActiveTool, EditorHookProps, selectionDependentTools } from "../types"
import { ShapeSidebar } from "./shape-sidebar"
import { Emote, EmoteForSale } from "@prisma/client"
import { FillColorSidebar } from "./fill-color-sidebar"
import { StrokeColorSidebar } from "./stroke-color-sidebar"
import { StrokeWidthSidebar } from "./stroke-width-sidebar"
import { OpacitySidebar } from "./opacity-sidebar"
import { TextSidebar } from "./text-sidebar"
import { FontSidebar } from "./font-sidebar"
import { ImageSidebar } from "./image-sidebar"
import { EmoteSidebar } from "./emote-sidebar"
import { useUser } from "@clerk/nextjs"
import { EmoteGeneratorSidebar } from "./generate-sidebar"
import { FilterSidebar } from "./filter-sidebar"
import { DrawSidebar } from "./draw-sidebar"
import { InpaintSidebar } from "./inpaint-sidebar" // Add this import
import { EnhanceSidebar } from "./enhance-sidebar"
import { VideoGeneratorSidebar } from "./video-sidebar"
import { VideoControls } from './video-controls';

interface EditorProps {
  userId: string;
  emotes: Emote[];
}

export const Editor = ({ userId, emotes: initialEmotes }: EditorProps) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("select")
  const [emotes, setEmotes] = useState<Emote[]>(initialEmotes)
  const [currentPrompt, setCurrentPrompt] = useState<string>("")

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select")
    }
  }, [activeTool])

  const { init, editor } = useEditor({
    clearSelectionCallback: onClearSelection
  })

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

    setActiveTool(tool); 
  }, [activeTool, editor])

  const canvasRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = new fabric.Canvas(
      canvasRef.current, 
      {
        backgroundColor: '#f0f0f0',
        width: 500,
        height: 500,
        controlsAboveOverlay: true,
        preserveObjectStacking: true,
        renderOnAddRemove: true,
        stateful: true,
      }
    )

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    }) 

    return () => {
      canvas.dispose();
    }
  }, [init])

  const addEmote = useCallback((newEmote: Emote) => {
    setEmotes(prevEmotes => [newEmote, ...prevEmotes])
  }, [])

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
        {/* <ImageSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        /> */}
        {/* <EnhanceSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        /> */}
        <EmoteSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          emotes={emotes} // Pass emotes as props
          setCurrentPrompt={setCurrentPrompt}
        />
        {/* <VideoGeneratorSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          emotes={emotes}
          setCurrentPrompt={setCurrentPrompt}
        /> */}
        <EmoteGeneratorSidebar 
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          emotes={emotes} // Pass emotes as props
          // setCurrentPrompt={setCurrentPrompt}
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
        <InpaintSidebar // Add the InpaintSidebar component
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Toolbar 
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            addEmote={addEmote}
            currentPrompt={currentPrompt}
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          />
          <div className="flex-1 relative bg-muted" ref={containerRef}>
            <canvas ref={canvasRef} />
            <div className="absolute inset-0 pointer-events-none">
                <VideoControls editor={editor} />
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
