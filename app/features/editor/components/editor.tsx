"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useEditor } from "../hooks/use-editor"
import { useAutoResize } from "../hooks/use-auto-resize"
import { useCanvasEvents } from "../hooks/use-canvas-events"
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
      // Don't clear selection when clicking outside
      // setActiveTool("select");
    }
  }, [activeTool]);

  const { editor, init } = useEditor({
    clearSelectionCallback: onClearSelection
  });

  // Initialize editor first
  useEffect(() => {
    if (containerRef.current && !editor?.stage) {
      init(containerRef.current, initialWorkspaceType);
      setIsEditorReady(true);
    }
  }, [init, initialWorkspaceType, editor?.stage]);

  // Setup auto-resize
  useAutoResize({
    stage: editor?.stage || null,
    container: containerRef.current
  });

  // Setup canvas events
  useCanvasEvents({
    stage: editor?.stage || null,
    editor
  });

  const onChangeActiveTool = useCallback((tool: ActiveTool) => {
    if (tool === "draw") {
      editor?.enableDrawingMode();
    } else if (activeTool === "draw") {
      editor?.disableDrawingMode();
    }
    
    // Don't change selection when changing tools
    const selectedNode = editor?.selectedNode;
    setActiveTool(tool);
    if (selectedNode) {
      editor?.setSelectedNode(selectedNode);
    }

    // Ensure all layers remain visible
    editor?.layers.forEach(layer => {
      layer.show();
      layer.batchDraw();
    });
  }, [activeTool, editor]);

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
        <main className="flex-1 flex flex-col overflow-hidden">
          <Toolbar 
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            addEmote={addEmote}
            currentPrompt={currentPrompt}
          />
          <div className="flex-1 relative bg-neutral-100">
            <div 
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                ref={containerRef}
                className="relative"
                style={{
                  width: '512px',  // Match the stage size from use-editor.ts
                  height: '512px', // Match the stage size from use-editor.ts
                }}
              >
                <div className="absolute inset-0 bg-white" />
                {editor?.stage && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <VideoControls editor={editor} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
