"use client"

import { MousePointer2, Pencil, Eraser, Type, Square, Smile, Wand2, Sliders, Play } from "lucide-react";
import { ActiveTool, WorkspaceType } from "../types";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { cn } from "@/lib/utils";
import { KonvaEditor } from "../types";

interface SidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  workspaceType: WorkspaceType;
  editor: KonvaEditor | undefined;
}

export const Sidebar = ({ 
  activeTool,
  onChangeActiveTool,
  workspaceType,
  editor
}: SidebarProps) => {
  return (
    <aside className="bg-white relative border-r z-[50] w-[52px] flex flex-col items-center gap-y-4 p-2">
      <div className="flex flex-col items-center gap-y-4">
        {/* <Hint label="Select" side="right" sideOffset={10}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("select")}
            className={cn(activeTool === "select" && "bg-gray-100")}
          >
            <MousePointer2 className="size-5" />
          </Button>
        </Hint> */}
              <Hint label="Emotes" side="right" sideOffset={10}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("emotes")}
            className={cn(activeTool === "emotes" && "bg-gray-100")}
          >
            <Smile className="size-5" />
          </Button>
        </Hint>
        <Hint label="Generate" side="right" sideOffset={10}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("emote-generator")}
            className={cn(activeTool === "emote-generator" && "bg-gray-100")}
          >
            <Wand2 className="size-5" />
          </Button>
        </Hint>
        {/* <Hint label="Draw" side="right" sideOffset={10}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("draw")}
            className={cn(activeTool === "draw" && "bg-gray-100")}
          >
            <Pencil className="size-5" />
          </Button>
        </Hint> */}
        {/* <Hint label="Eraser" side="right" sideOffset={10}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("eraser")}
            className={cn(activeTool === "eraser" && "bg-gray-100")}
          >
            <Eraser className="size-5" />
          </Button>
        </Hint> */}
        <Hint label="Text" side="right" sideOffset={10}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("text")}
            className={cn(activeTool === "text" && "bg-gray-100")}
          >
            <Type className="size-5" />
          </Button>
        </Hint>
        <Hint label="Shapes" side="right" sideOffset={10}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("shapes")}
            className={cn(activeTool === "shapes" && "bg-gray-100")}
          >
            <Square className="size-5" />
          </Button>
        </Hint>
        <Hint label="Filter" side="right" sideOffset={10}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("filter")}
            className={cn(activeTool === "filter" && "bg-gray-100")}
          >
            <Sliders className="size-5" />
          </Button>
        </Hint>
        <Hint label="Animate" side="right" sideOffset={10}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("animate")}
            className={cn(activeTool === "animate" && "bg-gray-100")}
          >
            <Play className="size-5" />
          </Button>
        </Hint>
      </div>
    </aside>
  );
};