import { useCallback, useState, useMemo, useRef } from "react";
import Konva from 'konva';
import { KonvaEditor, WorkspaceType, VideoObject, DEFAULT_WORKSPACE_CONFIGS, DEFAULT_EDITOR_STATE, EditorState, ShapeType, KonvaTextOptions, FilterType, LayerType } from "../types";
import axios from "axios";
import toast from "react-hot-toast";
import { Emote } from "@prisma/client";

interface UseEditorProps {
  clearSelectionCallback?: () => void;
}

interface UseEditorReturn {
  editor: KonvaEditor;
  init: (container: HTMLDivElement, workspaceType: WorkspaceType) => void;
}

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      reject(new Error('Failed to load image'));
    };
    // The URL should already be proxied at this point
    img.src = url;
  });
};

export const useEditor = ({ clearSelectionCallback }: UseEditorProps): UseEditorReturn => {
  const [stage, setStage] = useState<Konva.Stage | null>(null);
  const [layers, setLayers] = useState<Map<LayerType, Konva.Layer>>(new Map());
  const [activeLayer, setActiveLayer] = useState<Konva.Layer | null>(null);
  const [selectedNode, setSelectedNode] = useState<Konva.Node | null>(null);
  const [editorState, setEditorState] = useState<EditorState>(DEFAULT_EDITOR_STATE);
  const transformer = useRef<Konva.Transformer | null>(null);
  const savedSelection = useRef<Konva.Node | null>(null);
  const history = useRef<{ undoStack: Konva.Node[][], redoStack: Konva.Node[][] }>({
    undoStack: [],
    redoStack: []
  });

  const saveSelection = useCallback(() => {
    savedSelection.current = selectedNode;
  }, [selectedNode]);

  const restoreSelection = useCallback(() => {
    if (savedSelection.current) {
      setSelectedNode(savedSelection.current);
      if (transformer.current) {
        (transformer.current as any).nodes([savedSelection.current]);
      }
    }
  }, []);

  const saveToHistory = useCallback(() => {
    if (!activeLayer) return;
    const nodes = activeLayer.children || [];
    history.current.undoStack.push(nodes.map(node => node.clone()));
    history.current.redoStack = [];
  }, [activeLayer]);

  const init = useCallback((container: HTMLDivElement, workspaceType: WorkspaceType) => {
    const config = DEFAULT_WORKSPACE_CONFIGS[workspaceType];
    
    const newStage = new Konva.Stage({
      container,
      width: config.width,
      height: config.height
    });

    // Create initial layers
    const newLayers = new Map<LayerType, Konva.Layer>();
    const mainLayer = new Konva.Layer();
    const emotesLayer = new Konva.Layer();
    const shapesLayer = new Konva.Layer();
    const textLayer = new Konva.Layer();
    const generatedLayer = new Konva.Layer();

    // Set initial visibility
    mainLayer.visible(true);
    emotesLayer.visible(true);
    shapesLayer.visible(true);
    textLayer.visible(true);
    generatedLayer.visible(true);

    newLayers.set('main', mainLayer);
    newLayers.set('emotes', emotesLayer);
    newLayers.set('shapes', shapesLayer);
    newLayers.set('text', textLayer);
    newLayers.set('generated', generatedLayer);

    // Add all layers to stage
    newStage.add(mainLayer);
    newStage.add(emotesLayer);
    newStage.add(shapesLayer);
    newStage.add(textLayer);
    newStage.add(generatedLayer);

    // Add background to main layer
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: config.width,
      height: config.height,
      fill: config.backgroundColor,
      name: 'background'
    });
    mainLayer.add(background);

    // Add transformer to main layer
    const newTransformer = new Konva.Transformer({
      boundBoxFunc: (oldBox, newBox) => {
        const maxWidth = config.width * 2;
        const maxHeight = config.height * 2;
        if (newBox.width > maxWidth || newBox.height > maxHeight) {
          return oldBox;
        }
        return newBox;
      }
    });
    mainLayer.add(newTransformer);
    transformer.current = newTransformer;

    // Setup event listeners
    newStage.on('click tap', (e) => {
      const target = e.target;
      const isBackground = target === background || target === newStage;
      const isTransformer = transformer.current && (target as any).getClassName?.() === 'Transformer';

      if (isBackground) {
        setSelectedNode(null);
        if (transformer.current) {
          (transformer.current as any).nodes([]);
        }
        clearSelectionCallback?.();
        return;
      }

      if (isTransformer) return;

      if (target instanceof Konva.Image && target.parent?.getAttr('objectType') === 'video') {
        const videoGroup = target.parent;
        setSelectedNode(videoGroup);
        if (transformer.current) {
          (transformer.current as any).nodes([videoGroup]);
        }
        return;
      }

      if (target instanceof Konva.Group || target instanceof Konva.Shape || target instanceof Konva.Image) {
        setSelectedNode(target);
        if (transformer.current) {
          (transformer.current as any).nodes([target]);
        }
      }
    });

    setStage(newStage);
    setLayers(newLayers);
    setActiveLayer(mainLayer);

    // Ensure all layers are visible after initialization
    newLayers.forEach(layer => {
      layer.visible(true);
      layer.draw();
    });
  }, [clearSelectionCallback]);

  const addLayer = useCallback((type: LayerType): Konva.Layer => {
    const newLayer = new Konva.Layer();
    stage?.add(newLayer);
    setLayers(prev => {
      const newLayers = new Map(prev);
      newLayers.set(type, newLayer);
      return newLayers;
    });
    return newLayer;
  }, [stage]);

  const getLayer = useCallback((type: LayerType): Konva.Layer | null => {
    return layers.get(type) || null;
  }, [layers]);

  const handleSetActiveLayer = useCallback((type: LayerType) => {
    const layer = layers.get(type);
    if (layer && stage) {
      // Set the new active layer
      setActiveLayer(layer);

      // Ensure all layers are visible and drawn
      stage.getLayers().forEach(l => {
        l.visible(true);
        l.draw();
      });

      // Move the active layer to top for proper stacking
      layer.moveToTop();

      // If there's a transformer, make sure it stays with its target
      if (transformer.current && transformer.current.nodes().length > 0) {
        const targetNode = transformer.current.nodes()[0];
        const targetLayer = targetNode.getLayer();
        if (targetLayer) {
          transformer.current.remove(); // Remove from current layer
          targetLayer.add(transformer.current); // Add to target's layer
          transformer.current.moveToTop();
          targetLayer.draw();
        }
      }

      // Final draw to ensure everything is visible
      stage.draw();
    }
  }, [stage, layers]);

  const editor: KonvaEditor = useMemo(() => ({
    stage,
    layers,
    activeLayer,
    selectedNode,
    history: history.current,

    init,
    setStage,
    setActiveLayer: handleSetActiveLayer,
    addLayer,
    getLayer,
    setSelectedNode,

    addImage: async (url: string) => {
      if (!activeLayer || !stage) {
        console.error('No layer or stage available');
        return Promise.reject('No layer or stage');
      }

      console.log('Creating new image with URL:', url);
      const image = new Image();
      image.crossOrigin = 'anonymous';
      
      return new Promise<void>((resolve, reject) => {
        image.onload = () => {
          try {
            console.log('Image loaded successfully');
            const konvaImage = new Konva.Image({
              image: image,
              draggable: true,
              x: stage.width() / 2,
              y: stage.height() / 2,
              listening: true // Ensure the image can receive events
            });

            // Scale image to fit workspace while maintaining aspect ratio
            const scale = Math.min(
              stage.width() / image.width,
              stage.height() / image.height
            ) * 0.8;

            konvaImage.scale({ x: scale, y: scale });
            konvaImage.position({
              x: (stage.width() - image.width * scale) / 2,
              y: (stage.height() - image.height * scale) / 2
            });

            // Add to layer and ensure it's visible
            activeLayer.add(konvaImage);
            activeLayer.moveToTop();
            activeLayer.visible(true);
            
            // Draw all layers to ensure everything is visible
            stage.getLayers().forEach(layer => {
              layer.visible(true);
              layer.draw();
            });

            // Select the newly added image
            setSelectedNode(konvaImage);
            if (transformer.current) {
              transformer.current.nodes([konvaImage]);
              transformer.current.moveToTop();
            }

            saveToHistory();
            console.log('Image added to canvas successfully');
            resolve();
          } catch (error) {
            console.error('Error adding image to canvas:', error);
            reject(error);
          }
        };
        image.onerror = (error) => {
          console.error('Error loading image:', error);
          reject(new Error('Failed to load image'));
        };
        // Use the proxy route to avoid CORS issues
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
        image.src = proxyUrl;
      });
    },

    addVideo: async (url: string) => {
      if (!activeLayer || !stage) {
        console.error('No layer or stage available');
        return Promise.reject('No layer or stage');
      }

      console.log('Creating new video with URL:', url);
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      // Use the proxy route for videos as well
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      video.src = proxyUrl;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;

      return new Promise<VideoObject>((resolve, reject) => {
        video.onloadedmetadata = () => {
          try {
            console.log('Video loaded successfully');
            
            // Create the group first
            const group = new Konva.Group({
              draggable: true,
              name: 'video-group'
            }) as VideoObject;

            // Calculate scale to fill canvas
            const scaleX = stage.width() / video.videoWidth;
            const scaleY = stage.height() / video.videoHeight;
            const scale = Math.max(scaleX, scaleY);

            // Create the video image
            const konvaVideo = new Konva.Image({
              image: video,
              width: video.videoWidth,
              height: video.videoHeight,
              scaleX: scale,
              scaleY: scale,
              x: (stage.width() - video.videoWidth * scale) / 2,
              y: (stage.height() - video.videoHeight * scale) / 2
            });

            // Add the video to the group
            group.add(konvaVideo);

            // Add video methods to the group
            group.getVideoElement = () => video;
            group.play = () => {
              video.currentTime = group.attrs.startTime || 0;
              video.play().catch(console.error);
              activeLayer.draw();
            };
            group.pause = () => {
              video.pause();
              activeLayer.draw();
            };
            group.setStartTime = (time: number) => {
              const newTime = Math.max(0, Math.min(time, video.duration));
              group.attrs.startTime = newTime;
              if (video.currentTime < newTime) {
                video.currentTime = newTime;
              }
              activeLayer.draw();
            };
            group.setEndTime = (time: number) => {
              const newTime = Math.max(group.attrs.startTime || 0, Math.min(time, video.duration));
              group.attrs.endTime = newTime;
              if (video.currentTime > newTime) {
                video.currentTime = group.attrs.startTime || 0;
              }
              activeLayer.draw();
            };
            group.getDuration = () => video.duration;
            group.getCurrentTime = () => video.currentTime;
            group.setCurrentTime = (time: number) => {
              const startTime = group.attrs.startTime || 0;
              const endTime = group.attrs.endTime || video.duration;
              const newTime = Math.max(startTime, Math.min(time, endTime));
              video.currentTime = newTime;
              activeLayer.draw();
            };

            // Add the group to the layer
            activeLayer.add(group);

            // Create animation to update video frames
            const anim = new Konva.Animation(() => {
              activeLayer.batchDraw();
              return true;
            }, activeLayer);

            // Add video loop handling
            video.addEventListener('timeupdate', () => {
              if (!video.paused) {
                const startTime = group.attrs.startTime;
                const endTime = group.attrs.endTime;
                if (video.currentTime < startTime) {
                  video.currentTime = startTime;
                } else if (video.currentTime >= endTime) {
                  video.currentTime = startTime;
                  video.play().catch(console.error);
                }
              }
            });

            // Initialize video attributes
            group.attrs.startTime = 0;
            group.attrs.endTime = video.duration;
            group.attrs.objectType = 'video';
            group.attrs.videoElement = video;

            // Start animation and play video
            anim.start();
            group.play();

            // Save to history
            saveToHistory();
            console.log('Video added to canvas successfully');
            resolve(group);
          } catch (error) {
            console.error('Error adding video to canvas:', error);
            reject(error);
          }
        };
        video.onerror = (error) => {
          console.error('Error loading video:', error);
          reject(new Error('Failed to load video'));
        };
        video.load();
      });
    },

    isVideoObject: (node: Konva.Node): node is VideoObject => {
      return node instanceof Konva.Group && 
        node.getAttr('objectType') === 'video' && 
        node.getAttr('videoElement') instanceof HTMLVideoElement;
    },

    addText: (text: string, options?: KonvaTextOptions) => {
      if (!activeLayer || !stage) return;

      const textNode = new Konva.Text({
        text,
        fontSize: options?.fontSize || editorState.fontSize,
        fontFamily: options?.fontFamily || editorState.fontFamily,
        fill: options?.fill || editorState.fillColor,
        align: options?.align || 'left',
        width: options?.width,
        fontStyle: options?.fontWeight ? 'bold' : 'normal',
        draggable: true,
        x: stage.width() / 2,
        y: stage.height() / 2
      });

      activeLayer.add(textNode);
      saveToHistory();
    },

    addShape: (type: ShapeType) => {
      if (!activeLayer || !stage) return;

      let shape: Konva.Shape;
      const commonConfig = {
        fill: editorState.fillColor,
        stroke: editorState.strokeColor,
        strokeWidth: editorState.strokeWidth,
        draggable: true,
        x: stage.width() / 2,
        y: stage.height() / 2
      };

      switch (type) {
        case 'rectangle':
          shape = new Konva.Rect({
            ...commonConfig,
            width: 100,
            height: 100
          });
          break;
        case 'circle':
          shape = new Konva.Circle({
            ...commonConfig,
            radius: 50
          });
          break;
        case 'triangle':
          shape = new Konva.RegularPolygon({
            ...commonConfig,
            sides: 3,
            radius: 50
          });
          break;
        case 'diamond':
          shape = new Konva.RegularPolygon({
            ...commonConfig,
            sides: 4,
            radius: 50,
            rotation: 45
          });
          break;
        case 'inverseTriangle':
          shape = new Konva.RegularPolygon({
            ...commonConfig,
            sides: 3,
            radius: 50,
            rotation: 180
          });
          break;
      }

      activeLayer.add(shape);
      saveToHistory();
    },

    removeSelected: () => {
      if (!selectedNode || !activeLayer) return;
      selectedNode.destroy();
      setSelectedNode(null);
      transformer.current?.nodes([]);
      saveToHistory();
    },

    clear: () => {
      if (!activeLayer) return;
      const background = activeLayer.findOne('.background');
      activeLayer.destroyChildren();
      if (background) activeLayer.add(background as any);
      if (transformer.current) activeLayer.add(transformer.current as any);
      saveToHistory();
    },

    download: () => {
      if (!stage) return;
      const dataURL = stage.toDataURL();
      const link = document.createElement('a');
      link.download = 'canvas.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    undo: () => {
      if (!activeLayer || history.current.undoStack.length === 0) return;
      const currentState = activeLayer.children?.map(node => node.clone());
      if (currentState) history.current.redoStack.push(currentState);
      
      const previousState = history.current.undoStack.pop();
      if (previousState) {
        activeLayer.destroyChildren();
        previousState.forEach(node => activeLayer.add(node as any));
      }
    },

    redo: () => {
      if (!activeLayer || history.current.redoStack.length === 0) return;
      const currentState = activeLayer.children?.map(node => node.clone());
      if (currentState) history.current.undoStack.push(currentState);
      
      const nextState = history.current.redoStack.pop();
      if (nextState) {
        activeLayer.destroyChildren();
        nextState.forEach(node => activeLayer.add(node as any));
      }
    },

    enableDrawingMode: () => {
      if (!stage) return;
      stage.container().style.cursor = 'crosshair';
      let isDrawing = false;
      let lastLine: Konva.Line | null = null;

      // Save the current selection
      saveSelection();

      stage.on('mousedown touchstart', (e) => {
        isDrawing = true;
        const pos = stage.getPointerPosition();
        if (!pos) return;

        lastLine = new Konva.Line({
          stroke: editorState.strokeColor,
          strokeWidth: editorState.strokeWidth,
          points: [pos.x, pos.y],
          draggable: true
        });

        activeLayer?.add(lastLine);
      });

      stage.on('mousemove touchmove', () => {
        if (!isDrawing || !lastLine) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;

        const newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
        activeLayer?.batchDraw();
      });

      stage.on('mouseup touchend', () => {
        isDrawing = false;
        if (lastLine) {
          saveToHistory();
          // Restore the previous selection after drawing
          restoreSelection();
        }
      });
    },

    disableDrawingMode: () => {
      if (!stage) return;
      stage.container().style.cursor = 'default';
      stage.off('mousedown touchstart mousemove touchmove mouseup touchend');
      // Restore selection when disabling drawing mode
      restoreSelection();
    },

    setStrokeColor: (color: string) => {
      setEditorState(prev => ({ ...prev, strokeColor: color }));
      if (selectedNode instanceof Konva.Shape) {
        selectedNode.stroke(color);
        activeLayer?.batchDraw();
      }
    },

    setFillColor: (color: string) => {
      setEditorState(prev => ({ ...prev, fillColor: color }));
      if (selectedNode instanceof Konva.Shape || selectedNode instanceof Konva.Text) {
        selectedNode.fill(color);
        activeLayer?.batchDraw();
      }
    },

    setStrokeWidth: (width: number) => {
      setEditorState(prev => ({ ...prev, strokeWidth: width }));
      if (selectedNode instanceof Konva.Shape) {
        selectedNode.strokeWidth(width);
        activeLayer?.batchDraw();
      }
    },

    setFontFamily: (font: string) => {
      setEditorState(prev => ({ ...prev, fontFamily: font }));
      if (selectedNode instanceof Konva.Text) {
        selectedNode.fontFamily(font);
        activeLayer?.batchDraw();
      }
    },

    setFontSize: (size: number) => {
      setEditorState(prev => ({ ...prev, fontSize: size }));
      if (selectedNode instanceof Konva.Text) {
        selectedNode.fontSize(size);
        activeLayer?.batchDraw();
      }
    },

    setOpacity: (opacity: number) => {
      setEditorState(prev => ({ ...prev, opacity }));
      if (selectedNode) {
        selectedNode.opacity(opacity);
        activeLayer?.batchDraw();
      }
    },

    bringForward: () => {
      if (!selectedNode) return;
      selectedNode.moveUp();
      activeLayer?.batchDraw();
    },

    sendBackward: () => {
      if (!selectedNode) return;
      selectedNode.moveDown();
      activeLayer?.batchDraw();
    },

    getActiveObject: () => selectedNode,
    
    getActiveObjects: () => {
      if (!selectedNode) return [];
      return [selectedNode];
    },

    getActiveImageUrl: () => {
      if (!selectedNode || !stage) {
        throw new Error('No image selected');
      }

      // If the selected node is an image
      if (selectedNode instanceof Konva.Image) {
        const imageElement = selectedNode.image() as HTMLImageElement;
        return imageElement.src;
      }

      // If no valid image is selected
      throw new Error('Selected node is not an image');
    },

    saveEmote: async (prompt: string, userId: string) => {
      if (!stage) return;
      
      try {
        const dataURL = stage.toDataURL();
        const response = await axios.post<Emote>('/api/saveemote', {
          prompt,
          imageUrl: dataURL,
          style: "custom",
          model: "canvas",
          userId
        });

        return response.data;
      } catch (error) {
        console.error('Failed to save emote:', error);
        toast.error('Failed to save emote');
      }
    },

    inpaint: async (prompt: string, maskUrl: string) => {
      if (!selectedNode || !(selectedNode instanceof Konva.Image)) {
        toast.error('No image selected for inpainting');
        return;
      }

      try {
        const imageUrl = (selectedNode.image() as HTMLImageElement).src;
        const response = await axios.post('/api/inpaint', {
          prompt,
          image_url: imageUrl,
          mask_url: maskUrl,
        });

        if (response.status !== 200) {
          throw new Error('Failed to inpaint image');
        }

        const newImageUrl = response.data.image.url;
        await editor.addImage(newImageUrl);
        selectedNode.destroy();
        activeLayer?.batchDraw();
      } catch (error) {
        console.error('Error inpainting image:', error);
        toast.error('Failed to inpaint image');
      }
    },

    removeBackground: async () => {
      if (!selectedNode || !(selectedNode instanceof Konva.Image)) {
        toast.error('No image selected');
        return;
      }

      try {
        const imageElement = selectedNode.image() as HTMLImageElement;
        const imageUrl = imageElement.src;
        console.log('Removing background from:', imageUrl);
        
        // Get the original URL if it's proxied
        let originalUrl = imageUrl;
        if (imageUrl.includes('/api/proxy-image?url=')) {
          originalUrl = decodeURIComponent(imageUrl.split('/api/proxy-image?url=')[1]);
        }
        
        const response = await axios.post('/api/fal/birefnet-bg-remove', {
          image: originalUrl
        });

        if (response.status !== 200 || !response.data?.image?.url) {
          throw new Error('Failed to remove background');
        }

        console.log('Background removed, new image:', response.data.image.url);
        await editor.addGeneratedEmote(response.data.image.url);
        selectedNode.destroy();
        activeLayer?.batchDraw();
        toast.success('Background removed successfully');
      } catch (error) {
        console.error('Error removing background:', error);
        toast.error('Failed to remove background');
      }
    },

    // Mask-related methods
    generateMaskUrl: () => {
      if (!stage) {
        throw new Error('No stage available');
      }

      // Create a temporary layer for the mask
      const maskLayer = new Konva.Layer();
      stage.add(maskLayer);

      // Find all mask shapes and add them to the temporary layer
      const maskShapes = activeLayer?.find('.mask');
      maskShapes?.forEach(shape => {
        const clone = shape.clone();
        clone.fill('white');
        clone.stroke('white');
        maskLayer.add(clone);
      });

      // Get the mask as a data URL
      const maskUrl = maskLayer.toDataURL({
        pixelRatio: 1
      });

      // Create a canvas to set the background color
      const canvas = document.createElement('canvas');
      canvas.width = stage.width();
      canvas.height = stage.height();
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw black background
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw mask on top
      const img = new Image();
      img.src = maskUrl;
      ctx.drawImage(img, 0, 0);

      const finalMaskUrl = canvas.toDataURL();

      // Clean up
      maskLayer.destroy();

      return finalMaskUrl;
    },

    startDrawingMask: () => {
      if (!stage) return;
      stage.container().style.cursor = 'crosshair';
      let isDrawing = false;
      let lastLine: Konva.Line | null = null;

      stage.on('mousedown touchstart', (e) => {
        isDrawing = true;
        const pos = stage.getPointerPosition();
        if (!pos) return;

        lastLine = new Konva.Line({
          stroke: '#ffffff',
          strokeWidth: 20,
          points: [pos.x, pos.y],
          name: 'mask',
          globalCompositeOperation: 'source-over',
          draggable: false
        });

        activeLayer?.add(lastLine);
      });

      stage.on('mousemove touchmove', () => {
        if (!isDrawing || !lastLine) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;

        const newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
        activeLayer?.batchDraw();
      });

      stage.on('mouseup touchend', () => {
        isDrawing = false;
        if (lastLine) {
          saveToHistory();
        }
      });
    },

    clearMask: () => {
      if (!activeLayer) return;
      const maskShapes = activeLayer.find('.mask');
      maskShapes.forEach(shape => shape.destroy());
      activeLayer.batchDraw();
      saveToHistory();
    },

    // Video-specific methods
    setVolume: (volume: number) => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return;
      const videoElement = selectedNode.getAttr('videoElement') as HTMLVideoElement;
      videoElement.volume = volume;
    },

    setPlaybackRate: (rate: number) => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return;
      const videoElement = selectedNode.getAttr('videoElement') as HTMLVideoElement;
      videoElement.playbackRate = rate;
    },

    setBrightness: (value: number) => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return;
      selectedNode.setAttr('brightness', value);
      activeLayer?.batchDraw();
    },

    setContrast: (value: number) => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return;
      selectedNode.setAttr('contrast', value);
      activeLayer?.batchDraw();
    },

    setSaturation: (value: number) => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return;
      selectedNode.setAttr('saturation', value);
      activeLayer?.batchDraw();
    },

    getVolume: () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return 1;
      const videoElement = selectedNode.getAttr('videoElement') as HTMLVideoElement;
      return videoElement.volume;
    },

    getPlaybackRate: () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return 1;
      const videoElement = selectedNode.getAttr('videoElement') as HTMLVideoElement;
      return videoElement.playbackRate;
    },

    getBrightness: () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return 100;
      return selectedNode.getAttr('brightness') ?? 100;
    },

    getContrast: () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return 100;
      return selectedNode.getAttr('contrast') ?? 100;
    },

    getSaturation: () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return 100;
      return selectedNode.getAttr('saturation') ?? 100;
    },

    changeImageFilter: (filter: FilterType) => {
      if (!selectedNode) return;
      // TODO: Implement image filter changes
    },

    addGeneratedEmote: async (url: string) => {
      if (!stage || !activeLayer) return Promise.reject("Editor not initialized");
      
      try {
        console.log('Loading generated emote:', url);
        const image = await loadImage(url);
        
        // Calculate scale to fit the image within the stage while maintaining aspect ratio
        const scale = Math.min(
          (stage.width() * 0.8) / image.width,
          (stage.height() * 0.8) / image.height
        );

        const imageNode = new Konva.Image({
          image,
          draggable: true,
          // Center the image on the stage
          x: (stage.width() - image.width * scale) / 2,
          y: (stage.height() - image.height * scale) / 2,
          scaleX: scale,
          scaleY: scale,
        });

        activeLayer.add(imageNode);
        activeLayer.batchDraw();
        saveToHistory();

        // Select the newly added image
        setSelectedNode(imageNode);
        if (transformer.current) {
          (transformer.current as any).nodes([imageNode]);
        }

        return Promise.resolve();
      } catch (error) {
        console.error('Error adding generated emote:', error);
        return Promise.reject(error);
      }
    },

    // Add these methods to the editor object
    setVideoStartTime: (time: number) => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return;
      const video = selectedNode.getVideoElement();
      const newTime = Math.max(0, Math.min(time, video.duration));
      selectedNode.attrs.startTime = newTime;
      if (video.currentTime < newTime) {
        video.currentTime = newTime;
      }
      activeLayer?.batchDraw();
    },

    setVideoEndTime: (time: number) => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return;
      const video = selectedNode.getVideoElement();
      const newTime = Math.max(selectedNode.attrs.startTime, Math.min(time, video.duration));
      selectedNode.attrs.endTime = newTime;
      if (video.currentTime > newTime) {
        video.currentTime = selectedNode.attrs.startTime;
      }
      activeLayer?.batchDraw();
    },

    getVideoStartTime: () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return 0;
      return selectedNode.attrs.startTime || 0;
    },

    getVideoEndTime: () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return 0;
      return selectedNode.attrs.endTime || selectedNode.getDuration();
    },

    getVideoDuration: () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) return 0;
      return selectedNode.getDuration();
    },

    // Add this method to the editor object
    downloadTrimmedVideo: async () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) {
        toast.error('No video selected for download');
        return;
      }

      try {
        console.log('Starting video download process...');
        const video = selectedNode.getVideoElement();
        const startTime = selectedNode.attrs.startTime || 0;
        const endTime = selectedNode.attrs.endTime || video.duration;
        
        console.log('Video details:', {
          startTime,
          endTime,
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight
        });

        // Create canvas with video dimensions
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Create MediaRecorder with appropriate settings
        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 5000000 // 5 Mbps
        });

        console.log('MediaRecorder created');
        const chunks: Blob[] = [];

        // Create a promise that resolves when recording is complete
        const recordingComplete = new Promise<Blob>((resolve) => {
          mediaRecorder.ondataavailable = (e) => {
            console.log('Data chunk available:', e.data.size, 'bytes');
            chunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            console.log('Recording stopped, creating final video...');
            const blob = new Blob(chunks, { type: 'video/webm' });
            resolve(blob);
          };
        });
        
        // Start recording
        mediaRecorder.start();
        console.log('Recording started');

        // Seek to start time
        video.currentTime = startTime;
        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
        });

        // Start playback
        await video.play();
        console.log('Video playback started');

        // Function to draw frames
        const drawFrame = () => {
          if (video.currentTime >= endTime) {
            console.log('Reached end time, stopping recording');
            video.pause();
            mediaRecorder.stop();
            return;
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        };

        // Start drawing frames
        drawFrame();

        // Wait for the recording to complete and get the blob
        const videoBlob = await recordingComplete;
        console.log('Recording completed, initiating download...');

        // Create download link
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trimmed-video.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset video to start
        video.currentTime = startTime;
        console.log('Video download process completed');
      } catch (error) {
        console.error('Error during video download:', error);
        toast.error('Failed to download video: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    },

    getTrimmedVideoUrl: async () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) {
        throw new Error('No video selected');
      }

      const video = selectedNode.getVideoElement();
      return video.src;
    },
  }), [
    stage, 
    layers, 
    activeLayer, 
    selectedNode, 
    init, 
    addLayer, 
    getLayer,
    handleSetActiveLayer
  ]);

  return { editor, init };
};