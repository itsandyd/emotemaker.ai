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
import Konva from 'konva'

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
          <div className="flex-1 bg-muted relative overflow-auto">
            <div 
              className="flex items-center justify-center min-h-full p-4 md:p-0"
              onClick={(e) => {
                // Only clear if clicking the wrapper div directly
                if (e.target === e.currentTarget && editor?.selectedNode) {
                  editor.setSelectedNode(null);
                  const transformers = editor.stage?.find('Transformer');
                  if (transformers?.length) {
                    transformers.forEach(transformer => {
                      if (transformer instanceof Konva.Transformer) {
                        transformer.nodes([]);
                        transformer.getLayer()?.batchDraw();
                      }
                    });
                  }
                }
              }}
            >
              <div 
                ref={containerRef} 
                className="w-[512px] h-[512px] bg-white"
              >
                {/* Konva stage will be rendered here */}
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
