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
import Konva from 'konva';

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
  const [zoomLevel, setZoomLevel] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const onClearSelection = useCallback(() => {
    if (activeTool !== "draw" && activeTool !== "video-controls") {
      // Don't clear selection when clicking outside
      // setActiveTool("select");
    }
  }, []);

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

  // Handle stage click events
  useEffect(() => {
    const stage = editor?.stage;
    if (!stage) return;

    const clickHandler = (e: any) => {
      // Prevent deselection when clicking the stage background
      if (e.target === stage) {
        e.cancelBubble = true;
      }
    };
    
    stage.on('click', clickHandler);
    return () => {
      stage.off('click', clickHandler);
    };
  }, [editor]);

  // Handle zoom and resize
  useEffect(() => {
    if (!editor?.stage || !isEditorReady || !containerRef.current) return;
    
    const handleResize = () => {
      if (!containerRef.current || !editor.stage) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Calculate the maximum scale that fits within the container
      const scaleX = containerWidth / DEFAULT_WORKSPACE_CONFIGS[initialWorkspaceType].width;
      const scaleY = containerHeight / DEFAULT_WORKSPACE_CONFIGS[initialWorkspaceType].height;
      const scale = Math.min(scaleX, scaleY, 1); // Never scale up beyond original size
      
      setZoomLevel(scale);

      const stage = editor.stage;
      // Update stage size to maintain aspect ratio
      stage.width(DEFAULT_WORKSPACE_CONFIGS[initialWorkspaceType].width);
      stage.height(DEFAULT_WORKSPACE_CONFIGS[initialWorkspaceType].height);
      stage.scale({ x: scale, y: scale });

      // Center the stage in the container
      stage.x((containerWidth - DEFAULT_WORKSPACE_CONFIGS[initialWorkspaceType].width * scale) / 2);
      stage.y((containerHeight - DEFAULT_WORKSPACE_CONFIGS[initialWorkspaceType].height * scale) / 2);

      // Make sure all layers are visible and drawn
      editor.layers.forEach(layer => {
        layer.show();
        layer.batchDraw();
      });
    }

    handleResize();
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    }
  }, [isEditorReady, editor?.stage, editor?.layers, initialWorkspaceType]);

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
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-200">
            <Toolbar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
              addEmote={addEmote}
              currentPrompt={currentPrompt}
            />
            <div className="flex-1 relative">
              <div 
                className="absolute inset-0"
                style={{
                  width: 500,
                  height: 500,
                  backgroundColor: '#f0f0f0',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -60%)`,
                }}
                ref={containerRef}
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
