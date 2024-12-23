"use client";

import { nanoid } from "nanoid";
import { useCallback, useMemo, useState, useEffect, useContext, useRef } from "react";
import { LiveObject } from "@liveblocks/client";
import { 
  useHistory, 
  useCanUndo, 
  useCanRedo,
  useMutation,
  useStorage,
  useOthersMapped,
  useSelf,
} from "@/liveblocks.config";
import { 
  colorToCss,
  connectionIdToColor, 
  findIntersectingLayersWithRectangle, 
  penPointsToPathLayer, 
  pointerEventToCanvasPoint, 
  resizeBounds,
} from "@/lib/utils";
import { 
  Camera, 
  CanvasMode, 
  CanvasState, 
  Color,
  EllipseLayer,
  ImageLayer,
  Layer,
  LayerType,
  NoteLayer,
  PathLayer,
  Point,
  RectangleLayer,
  Side,
  TextLayer,
  XYWH,
} from "@/types/canvas";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

import { Info } from "./info";
import { Path } from "./path";
import { Toolbar } from "./toolbar";
import { Participants } from "./participants";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { CursorsPresence } from "./cursors-presence";
import { OrgSidebar } from "@/components/canvas/org-sidebar";
import WhiteboardSidebar from "../../_components/sidebar";
import { useDropzone } from 'react-dropzone';
import RemoveBackgroundSidebar from "@/components/canvas/RemoveBackgroundSidebar";
import { ImageContext } from "@/providers/canvas/ImageContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Emote, EmoteForSale } from "@prisma/client";
import { saveAs } from "file-saver";

import axios from "axios";

const MAX_LAYERS = 5;

interface CanvasProps {
  boardId: string;
  emotes: (Emote & { EmoteForSale?: EmoteForSale | null })[]; // Update the type
};

export const Canvas = ({
  boardId,
  emotes
}: CanvasProps) => {
  const { uploadedImage, setUploadedImage, resultImage, setResultImage } = useContext(ImageContext);
  const layerIds = useStorage((root) => root.layerIds);

  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
const [canvasState, setCanvasState] = useState<CanvasState>({
  mode: CanvasMode.None,
  origin: { x: 0, y: 0 },
  current: { x: 0, y: 0}
});
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<Color>({ r: 0, g: 0, b: 0 });

  useDisableScrollBounce();
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
 const insertLayer = useMutation((
    { storage, setMyPresence },
    layerType: LayerType,
    position: Point,
    imageInfo?: { url: string; width: number; height: number }
  ) => {
    const liveLayers = storage.get("layers");
    if (liveLayers.size >= MAX_LAYERS) {
      return;
    }

    const liveLayerIds = storage.get("layerIds");
    const layerId = nanoid();
    let layer: LiveObject<Layer>;

    switch (layerType) {
      case LayerType.Image:
        if (!imageInfo) throw new Error("Image info is required for image layers");
        layer = new LiveObject({
          type: LayerType.Image,
          x: position.x,
          y: position.y,
          height: imageInfo.height,
          width: imageInfo.width,
          url: imageInfo.url,
        });
        break;
      case LayerType.Rectangle:
        layer = new LiveObject({
          type: LayerType.Rectangle,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: lastUsedColor,
        });
        break;
      case LayerType.Ellipse:
        layer = new LiveObject({
          type: LayerType.Ellipse,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: lastUsedColor,
        });
        break;
      case LayerType.Path:
        layer = new LiveObject({
          type: LayerType.Path,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: lastUsedColor,
          points: []
        });
        break;
      case LayerType.Text:
        layer = new LiveObject({
          type: LayerType.Text,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: lastUsedColor,
          value: "",
        });
        break;
      case LayerType.Note:
        layer = new LiveObject({
          type: LayerType.Note,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: lastUsedColor,
          value: "",
        });
        break;
      default:
        throw new Error("Unsupported layer type");
    }

    liveLayerIds.push(layerId);
    liveLayers.set(layerId, layer);
  
    setMyPresence({ selection: [layerId] }, { addToHistory: true });
    setCanvasState({
      mode: CanvasMode.None,
      origin: { x: 0, y: 0 }, // Include origin
      current: { x: 0, y: 0 } // Ensure current is always a Point
    });
  history.resume();
  }, [setCanvasState, lastUsedColor]);

  useEffect(() => {
    if (uploadedImage) {
      const img = new window.Image();
      img.onload = () => {
        insertLayer(LayerType.Image, { x: 0, y: 0 }, {
          url: uploadedImage,
          width: img.width,
          height: img.height,
        });
      };
      img.src = uploadedImage;
    }
  }, [uploadedImage, insertLayer]);
  
  useEffect(() => {
    if (resultImage) {
      const img = new window.Image();
      img.onload = () => {
        insertLayer(LayerType.Image, { x: 0, y: 0 }, {
          url: resultImage,
          width: img.width,
          height: img.height,
        });
      };
      img.src = resultImage;
    }
  }, [resultImage, insertLayer]);

  const translateSelectedLayers = useMutation((
    { storage, self },
    point: Point,
  ) => {
    if (canvasState.mode !== CanvasMode.Translating) {
      return;
    }

    const offset = {
      x: point.x - canvasState.current.x,
      y: point.y - canvasState.current.y,
    };

    const liveLayers = storage.get("layers");

    for (const id of self.presence.selection) {
      const layer = liveLayers.get(id);

      if (layer) {
        layer.update({
          x: layer.get("x") + offset.x,
          y: layer.get("y") + offset.y,
        });
      }
    }

    setCanvasState({ mode: CanvasMode.Translating, current: point });
  }, 
  [
    canvasState,
  ]);

  const unselectLayers = useMutation((
    { self, setMyPresence }
  ) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const updateSelectionNet = useMutation((
    { storage, setMyPresence },
    current: Point,
    origin: Point,
  ) => {
    const layers = storage.get("layers").toImmutable();
    setCanvasState({
      mode: CanvasMode.SelectionNet,
      origin,
      current,
    });

    const ids = findIntersectingLayersWithRectangle(
      layerIds,
      layers,
      origin,
      current,
    );

    setMyPresence({ selection: ids });
  }, [layerIds]);

  const startMultiSelection = useCallback((
    current: Point,
    origin: Point,
  ) => {
    if (
      Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5
    ) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

  const continueDrawing = useMutation((
    { self, setMyPresence },
    point: Point,
    e: React.PointerEvent,
  ) => {
    const { pencilDraft } = self.presence;

    if (
      canvasState.mode !== CanvasMode.Pencil ||
      e.buttons !== 1 ||
      pencilDraft == null
    ) {
      return;
    }

    setMyPresence({
      cursor: point,
      pencilDraft:
        pencilDraft.length === 1 &&
        pencilDraft[0][0] === point.x &&
        pencilDraft[0][1] === point.y
          ? pencilDraft
          : [...pencilDraft, [point.x, point.y, e.pressure]],
    });
  }, [canvasState.mode]);

  const insertPath = useMutation((
    { storage, self, setMyPresence }
  ) => {
    const liveLayers = storage.get("layers");
    const { pencilDraft } = self.presence;

    if (
      pencilDraft == null ||
      pencilDraft.length < 2 ||
      liveLayers.size >= MAX_LAYERS
    ) {
      setMyPresence({ pencilDraft: null });
      return;
    }

    const id = nanoid();
    liveLayers.set(
      id,
      new LiveObject(penPointsToPathLayer(
        pencilDraft,
        lastUsedColor,
      )),
    );

    const liveLayerIds = storage.get("layerIds");
    liveLayerIds.push(id);

    setMyPresence({ pencilDraft: null });
    setCanvasState({ mode: CanvasMode.Pencil });
  }, [lastUsedColor]);

  const startDrawing = useMutation((
    { setMyPresence },
    point: Point,
    pressure: number,
  ) => {
    setMyPresence({
      pencilDraft: [[point.x, point.y, pressure]],
      penColor: lastUsedColor,
    })
  }, [lastUsedColor]);

  const resizeSelectedLayer = useMutation((
    { storage, self },
    point: Point,
  ) => {
    if (canvasState.mode !== CanvasMode.Resizing) {
      return;
    }

    const bounds = resizeBounds(
      canvasState.initialBounds,
      canvasState.corner,
      point,
    );

    const liveLayers = storage.get("layers");
    const layer = liveLayers.get(self.presence.selection[0]);

    if (layer) {
      layer.update(bounds);
    };
  }, [canvasState]);

  const onResizeHandlePointerDown = useCallback((
    corner: Side,
    initialBounds: XYWH,
  ) => {
    history.pause();
    setCanvasState({
      mode: CanvasMode.Resizing,
      initialBounds,
      corner,
    });
  }, [history]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  const onPointerMove = useMutation((
    { setMyPresence }, 
    e: React.PointerEvent
  ) => {
    e.preventDefault();

    const current = pointerEventToCanvasPoint(e, camera);

    if (canvasState.mode === CanvasMode.Pressing) {
      startMultiSelection(current, canvasState.origin);
    } else if (canvasState.mode === CanvasMode.SelectionNet) {
      updateSelectionNet(current, canvasState.origin);
    } else if (canvasState.mode === CanvasMode.Translating) {
      translateSelectedLayers(current);
    } else if (canvasState.mode === CanvasMode.Resizing) {
      resizeSelectedLayer(current);
    } else if (canvasState.mode === CanvasMode.Pencil) {
      continueDrawing(current, e);
    }

    setMyPresence({ cursor: current });
  }, 
  [
    continueDrawing,
    camera,
    canvasState,
    resizeSelectedLayer,
    translateSelectedLayers,
    startMultiSelection,
    updateSelectionNet,
  ]);

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerDown = useCallback((
    e: React.PointerEvent,
  ) => {
    const point = pointerEventToCanvasPoint(e, camera);

    if (canvasState.mode === CanvasMode.Inserting) {
      return;
    }

    if (canvasState.mode === CanvasMode.Pencil) {
      startDrawing(point, e.pressure);
      return;
    }

    setCanvasState({ origin: point, mode: CanvasMode.Pressing });
  }, [camera, canvasState.mode, setCanvasState, startDrawing]);

  const onPointerUp = useMutation((
    {},
    e
  ) => {
    const point = pointerEventToCanvasPoint(e, camera);

    if (
      canvasState.mode === CanvasMode.None ||
      canvasState.mode === CanvasMode.Pressing
    ) {
      unselectLayers();
      setCanvasState({
        mode: CanvasMode.None,
        origin: { x: 0, y: 0 }, // Include origin
        current: { x: 0, y: 0 } // Ensure current is always a Point
      });
    history.resume();
    } else if (canvasState.mode === CanvasMode.Pencil) {
      insertPath();
    } else if (canvasState.mode === CanvasMode.Inserting) {
      insertLayer(canvasState.layerType, point);
    } else {
      setCanvasState({
        mode: CanvasMode.None,
        origin: { x: 0, y: 0 }, // Include origin
        current: { x: 0, y: 0 } // Ensure current is always a Point
      });
    history.resume();
    }

    history.resume();
  }, 
  [
    setCanvasState,
    camera,
    canvasState,
    history,
    insertLayer,
    unselectLayers,
    insertPath
  ]);

  const selections = useOthersMapped((other) => other.presence.selection);

  const onLayerPointerDown = useMutation((
    { self, setMyPresence },
    e: React.PointerEvent,
    layerId: string,
  ) => {
    if (
      canvasState.mode === CanvasMode.Pencil ||
      canvasState.mode === CanvasMode.Inserting
    ) {
      return;
    }

    history.pause();
    e.stopPropagation();

    const point = pointerEventToCanvasPoint(e, camera);

    if (!self.presence.selection.includes(layerId)) {
      setMyPresence({ selection: [layerId] }, { addToHistory: true });
    }
    setCanvasState({ mode: CanvasMode.Translating, current: point });
  }, 
  [
    setCanvasState,
    camera,
    history,
    canvasState.mode,
  ]);

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {};

    for (const user of selections) {
      const [connectionId, selection] = user;

      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId)
      }
    }

    return layerIdsToColorSelection;
  }, [selections]);

  const deleteLayers = useDeleteLayers();

  useEffect(() => {
    console.log("divRef.current in useEffect:", divRef.current);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Backspace":
          deleteLayers();
          break;
        case "z": {
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              history.redo();
            } else {
              history.undo();
            }
            break;
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [deleteLayers, history]);

  const divRef = useRef<HTMLDivElement>(null);

  const clearSelection = () => {
    setCanvasState((prevState) => ({
      ...prevState,
      mode: CanvasMode.None,
      current: { x: 0, y: 0 }, // Ensure current is always a Point
      origin: { x: 0, y: 0 } // Include origin
    }));
  };

  const handleDownloadPng = async () => {
    clearSelection();
  
    const svgElement = document.querySelector('#canvas-svg');
    if (!svgElement) {
      console.error("SVG element not found!");
      return;
    }
  
    svgElement.setAttribute('viewBox', '0 0 500 500');
    svgElement.setAttribute('width', '500px');
    svgElement.setAttribute('height', '500px');
  
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
    const unnecessaryElements = svgClone.querySelectorAll('.selection-box, .cursors-presence, rect');
    unnecessaryElements.forEach(el => el.remove());
  
    const imageElement = svgClone.querySelector('image');
    if (imageElement) {
      const imageUrl = imageElement.getAttribute('href');
      if (!imageUrl) {
        console.error("Image element does not have an href attribute");
        return;
      }
  
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
  
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
  
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 500, 500);
  
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, 'canvas.png');
            } else {
              console.error('Failed to create Blob from canvas.');
            }
          });
        } else {
          console.error('Failed to get canvas context.');
        }
      };
  
      img.onerror = (error) => {
        console.error('Error loading image:', error);
      };
  
      img.src = imageUrl;
    } else {
      console.error("Image element not found in SVG");
    }
  };
  
  const handleDownloadSvg = () => {
    clearSelection();
  
    const svgElement = document.querySelector('#canvas-svg');
    if (!svgElement) {
      console.error("SVG element not found!");
      return;
    }
  
    const selectionBox = document.querySelector('.selection-box') as HTMLElement;
    const cursorsPresence = document.querySelector('.cursors-presence') as HTMLElement;
  
    if (selectionBox) selectionBox.style.display = 'none';
    if (cursorsPresence) cursorsPresence.style.display = 'none';
  
    svgElement.setAttribute('viewBox', '0 0 500 500');
    svgElement.setAttribute('width', '500px');
    svgElement.setAttribute('height', '500px');
  
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
  
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
  
    const a = document.createElement('a');
    a.setAttribute('download', 'canvas.svg');
    a.setAttribute('href', url);
    a.click();
  
    URL.revokeObjectURL(url);
  
    if (selectionBox) selectionBox.style.display = 'block';
    if (cursorsPresence) cursorsPresence.style.display = 'block';
  };

  const handleSmartCrop = async () => {
    if (!uploadedImage) {
      console.error('No uploaded image found');
      return;
    }
  
    try {
      const response = await axios.post('/api/upload', {
        imageUrl: uploadedImage,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = response.data;
      if (data.url) {
        setResultImage(data.url);
        console.log('Transformed URL:', data.url);
      } else {
        console.error('Failed to get transformed URL:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex h-full w-full">
      <OrgSidebar />
      <RemoveBackgroundSidebar emotes={emotes} /> 
      <main className="flex-1 relative bg-neutral-100 touch-none flex items-center justify-center">
      <Toolbar
          canvasState={canvasState}
          setCanvasState={setCanvasState}
          canRedo={canRedo}
          canUndo={canUndo}
          undo={history.undo}
          redo={history.redo}
          deleteLayers={deleteLayers} 
          handleDownloadSvg={handleDownloadSvg}
          handleDownloadPng={handleDownloadPng}
          handleSmartCrop={handleSmartCrop} // Pass handleSmartCrop to Toolbar
        />
        <div ref={divRef} className="relative w-[500px] h-[500px] shadow-lg flex-shrink-0 m-24">
          <svg
            id="canvas-svg"
            className="w-[500px] h-[500px]"
            onWheel={onWheel}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            viewBox="0 0 500 500"
            width="500"
            height="500"
          >
            <g style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}>
              {layerIds.map((layerId) => (
                <LayerPreview
                  key={layerId}
                  id={layerId}
                  onLayerPointerDown={onLayerPointerDown}
                  selectionColor={layerIdsToColorSelection[layerId]}
                />
              ))}
              <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
              {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
                <rect
                  className=" stroke-blue-500 stroke-1"
                  x={Math.min(canvasState.origin.x, canvasState.current.x)}
                  y={Math.min(canvasState.origin.y, canvasState.current.y)}
                  width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                  height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                />
              )}
              <CursorsPresence />
              {pencilDraft != null && pencilDraft.length > 0 && (
                <Path
                  points={pencilDraft}
                  fill={colorToCss(lastUsedColor)}
                  x={0}
                  y={0}
                />
              )}
            </g>
          </svg>
        </div>
      </main>
    </div>
  );
};