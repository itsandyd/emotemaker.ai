"use client"

import { useEffect, useState } from "react";

interface CanvasDebugInfoProps {
  canvasSize: number;
  isEditorReady: boolean;
}

export const CanvasDebugInfo = ({ canvasSize, isEditorReady }: CanvasDebugInfoProps) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white text-xs p-2 rounded font-mono">
      <div>Canvas: {canvasSize}x{canvasSize}px</div>
      <div>Window: {windowSize.width}x{windowSize.height}px</div>
      <div>Ratio: 1:1 ✓</div>
      <div>Editor: {isEditorReady ? '✓' : '⏳'}</div>
    </div>
  );
}; 