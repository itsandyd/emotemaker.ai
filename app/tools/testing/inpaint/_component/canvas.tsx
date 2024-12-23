"use client"

import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Stage as StageType } from 'konva/lib/Stage';
import Konva from 'konva';

const Canvas = () => {
  const isDrawing = useRef(false);
  const stageRef = useRef<StageType | null>(null);
  
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (stageRef.current) {
      stageRef.current.setPointersPositions(pos);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point || !stageRef.current) {
      return;
    }
    let lastLine = stageRef.current.getChildren()[0].getChildren()[stageRef.current.getChildren()[0].getChildren().length - 1] as Konva.Line;
    const layer = lastLine.getLayer();
    if (!layer) return;
    
    lastLine.points(lastLine.points().concat([point.x, point.y]));
    layer.batchDraw();
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };
  
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={stageRef}
    >
      <Layer>
        <Line points={[]} stroke="black" />
      </Layer>
    </Stage>
  );
};

export default Canvas;
