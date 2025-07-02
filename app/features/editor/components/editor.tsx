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
import { AnimationSidebar } from './animation-sidebar'
import Konva from 'konva'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EditorProps {
  userId: string;
  emotes: Emote[];
  initialWorkspaceType?: WorkspaceType;
  subscriptionType?: string | null;
  isActiveSubscriber?: boolean;
}

export const Editor = ({ 
  userId, 
  emotes: initialEmotes,
  initialWorkspaceType = 'image',
  subscriptionType = null,
  isActiveSubscriber = false
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

  // Sync the currentPrompt state with the editor
  useEffect(() => {
    if (editor) {
      editor.setCurrentPrompt(currentPrompt);
    }
  }, [editor, currentPrompt]);

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

  const handleSetCurrentPrompt = useCallback((prompt: string) => {
    setCurrentPrompt(prompt);
    // The editor will be updated via the useEffect above
  }, []);

  // Calculate optimal canvas size to maintain 1:1 aspect ratio
  const calculateCanvasSize = useCallback(() => {
    if (typeof window === 'undefined') return 512; // Default for SSR
    
    // Dynamic calculation based on viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Account for UI elements dynamically
    const sidebarWidth = vw < 768 ? 0 : 80; // Mobile vs desktop sidebar
    const toolSidebarWidth = vw < 768 ? 0 : 240; // Tool sidebar width
    const navbarHeight = 60; // Navbar height
    const toolbarHeight = 60; // Toolbar height  
    const footerHeight = 40; // Footer height
    const padding = vw < 768 ? 24 : 48; // Mobile vs desktop padding
    
    // Calculate available space
    const availableWidth = vw - sidebarWidth - toolSidebarWidth - padding;
    const availableHeight = vh - navbarHeight - toolbarHeight - footerHeight - padding;
    
    // Use the smaller dimension to maintain square aspect ratio
    const maxSize = Math.min(availableWidth, availableHeight);
    
    // Responsive size constraints
    const minSize = vw < 768 ? 200 : 256; // Smaller minimum on mobile
    const maxSizeLimit = vw < 768 ? 400 : 512; // Smaller maximum on mobile
    
    return Math.max(minSize, Math.min(maxSizeLimit, maxSize));
  }, []);

  const [canvasSize, setCanvasSize] = useState(calculateCanvasSize);

  // Update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize(calculateCanvasSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateCanvasSize]);

  // Update editor stage size when canvas size changes
  useEffect(() => {
    if (editor?.stage && containerRef.current) {
      const stage = editor.stage;
      stage.width(canvasSize);
      stage.height(canvasSize);
      stage.batchDraw();
    }
  }, [canvasSize, editor?.stage]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Navbar with glassmorphism effect */}
      <div className="relative z-50 backdrop-blur-md bg-white/90 border-b border-white/20 shadow-sm">
        <Navbar 
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
      </div>
      
      <div className="flex flex-1 overflow-hidden relative"> 
        {/* Enhanced Main Sidebar */}
        <div className="relative z-40 backdrop-blur-md bg-white/95 border-r border-white/20 shadow-lg">
          <Sidebar 
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            workspaceType={initialWorkspaceType}
            editor={editor}
          />
        </div>

        {/* Tool Sidebars with improved styling and transitions */}
        <div className="relative z-30">
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "shapes" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <ShapeSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "fill" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <FillColorSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "stroke" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <StrokeColorSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "stroke-width" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <StrokeWidthSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "opacity" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <OpacitySidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "text" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <TextSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "font" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <FontSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "emotes" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <EmoteSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
              emotes={emotes}
              setCurrentPrompt={handleSetCurrentPrompt}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "video-settings" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <VideoSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
              emotes={emotes}
              setCurrentPrompt={handleSetCurrentPrompt}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "emote-generator" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <EmoteGeneratorSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
              emotes={emotes}
              addEmote={addEmote}
              currentPrompt={currentPrompt}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "filter" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <FilterSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "draw" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <DrawSidebar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "inpaint" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <InpaintSidebar
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            activeTool === "animate" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute"
          )}>
            <AnimationSidebar
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
        </div>

        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Enhanced Toolbar */}
          <div className="relative z-20 backdrop-blur-md bg-white/90 border-b border-white/20 shadow-sm">
            <Toolbar 
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
              addEmote={addEmote}
              currentPrompt={currentPrompt}
              subscriptionType={subscriptionType}
              isActiveSubscriber={isActiveSubscriber}
            />
          </div>
          
          {/* Enhanced Canvas Area */}
          <div className="flex-1 relative overflow-auto p-6 custom-scrollbar">
            <div 
              className="flex items-center justify-center min-h-full"
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
                            {/* Enhanced Canvas Container - Always 1:1 Aspect Ratio */}
              <Card className="relative overflow-hidden shadow-2xl border-0 bg-white/95 backdrop-blur-sm editor-canvas-container hover-lift">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 opacity-50" />
                <div 
                  ref={containerRef} 
                  className="relative bg-white"
                  style={{
                    width: `${canvasSize}px`,
                    height: `${canvasSize}px`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    minWidth: '256px',
                    minHeight: '256px'
                  }}
                >
                  {/* Konva stage will be rendered here */}
                </div>
                
                {/* Canvas decorative elements with subtle animations */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-60 animate-pulse" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-full opacity-60 animate-pulse delay-200" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full opacity-60 animate-pulse delay-700" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full opacity-60 animate-pulse delay-500" />
              </Card>
            </div>
          </div>
          
          {/* Enhanced Footer */}
          <div className="relative z-10 backdrop-blur-md bg-white/90 border-t border-white/20">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  )
}
