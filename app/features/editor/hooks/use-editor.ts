import { useCallback, useState, useMemo, useRef } from "react";
import Konva from 'konva';
import { KonvaEditor, WorkspaceType, VideoObject, DEFAULT_WORKSPACE_CONFIGS, DEFAULT_EDITOR_STATE, EditorState, ShapeType, KonvaTextOptions, FilterType, LayerType, ActiveTool, AnimationConfig } from "../types";
import axios from "axios";
import toast from "react-hot-toast";
import { Emote } from "@prisma/client";
import GIF from 'gif.js';

// Store active tweens for each node
const nodeTweens = new WeakMap<Konva.Node, Konva.Tween[]>();

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
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
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
    // Set fixed size for stage (512x512)
    const stageSize = 512;
    
    const newStage = new Konva.Stage({
      container,
      width: stageSize,
      height: stageSize,
      // Explicitly set pixelRatio to 1 to match canvas and CSS dimensions
      pixelRatio: 1
    });

    // Create workspace/background - same size as stage
    const workspace = new Konva.Rect({
      width: stageSize,
      height: stageSize,
      fill: '#ffffff',
      name: 'workspace',
      // Remove shadow effects as they can cause rendering artifacts
      shadowColor: 'rgba(0,0,0,0)',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    });

    // Create all necessary layers
    const newLayers = new Map<LayerType, Konva.Layer>();
    const mainLayer = new Konva.Layer({
      // Set layer-specific options
      imageSmoothingEnabled: false,
      pixelRatio: 1
    });
    const emotesLayer = new Konva.Layer({
      imageSmoothingEnabled: false,
      pixelRatio: 1
    });
    const shapesLayer = new Konva.Layer({
      imageSmoothingEnabled: false,
      pixelRatio: 1
    });
    const textLayer = new Konva.Layer({
      imageSmoothingEnabled: false,
      pixelRatio: 1
    });
    const generatedLayer = new Konva.Layer({
      imageSmoothingEnabled: false,
      pixelRatio: 1
    });

    // Add layers to stage
    newStage.add(mainLayer);
    newStage.add(emotesLayer);
    newStage.add(shapesLayer);
    newStage.add(textLayer);
    newStage.add(generatedLayer);

    // Store layers in map
    newLayers.set('main', mainLayer);
    newLayers.set('emotes', emotesLayer);
    newLayers.set('shapes', shapesLayer);
    newLayers.set('text', textLayer);
    newLayers.set('generated', generatedLayer);

    // Add workspace to main layer
    mainLayer.add(workspace);
    workspace.position({
      x: 0,
      y: 0
    });

    // Add transformer
    const newTransformer = new Konva.Transformer({
      boundBoxFunc: (oldBox, newBox) => {
        // Keep within workspace bounds
        if (
          newBox.x < 0 ||
          newBox.y < 0 ||
          newBox.x + newBox.width > stageSize ||
          newBox.y + newBox.height > stageSize
        ) {
          return oldBox;
        }
        return newBox;
      },
      padding: 0,
      ignoreStroke: true,
      borderStroke: '#0096FF',
      borderStrokeWidth: 1,
      anchorStroke: '#0096FF',
      anchorFill: '#fff',
      anchorSize: 8,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      rotateEnabled: true,
      keepRatio: true,
      centeredScaling: false,
    });

    // Add transformer to emotes layer instead of main layer
    // emotesLayer.add(newTransformer);
    transformer.current = newTransformer;

    // Setup clipping for all layers to stay within workspace
    const clipFunc = (ctx: CanvasRenderingContext2D) => {
      ctx.rect(0, 0, stageSize, stageSize);
    };

    [emotesLayer, shapesLayer, textLayer, generatedLayer].forEach(layer => {
      layer.clipFunc(clipFunc);
    });

    // Update resize handler to maintain square aspect ratio for both stage and workspace
    const handleResize = () => {
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      // Calculate available space considering padding
      const availableWidth = Math.min(containerWidth, window.innerWidth - 32); // 2rem (32px) padding
      const availableHeight = Math.min(containerHeight, window.innerWidth - 32);
      
      // Use the smaller dimension to maintain square aspect ratio
      const size = Math.min(availableWidth, availableHeight, stageSize);
      
      // Update stage size
      newStage.width(size);
      newStage.height(size);
      
      // Scale stage to fit container while maintaining aspect ratio
      const scale = size / stageSize;
      newStage.scale({ x: scale, y: scale });
      
      // Update container size to match stage
      container.style.width = `${size}px`;
      container.style.height = `${size}px`;
      
      // Center the container
      container.style.margin = 'auto';
      
      newStage.draw();
    };

    // Initial resize
    handleResize();
    window.addEventListener('resize', handleResize);

    // Setup event listeners
    newStage.on('click tap', (e) => {
      const target = e.target;
      const currentSelection = selectedNode;
      
      console.log('🎯 CLICK EVENT:', {
        targetType: target.getClassName(),
        targetName: target.name(),
        hasParent: !!target.parent,
        parentType: target.parent?.getClassName(),
        parentObjectType: target.parent?.getAttr('objectType'),
        isVideoGroup: target.getAttr('objectType') === 'video',
        targetAttrs: target.getAttrs()
      });

      // If we currently have a video selected, don't allow deselection
      if (currentSelection && editor.isVideoObject(currentSelection)) {
        // Keep the current video selected
        if (transformer.current) {
          transformer.current.nodes([currentSelection]);
          transformer.current.moveToTop();
        }
        return;
      }

      // Rest of the click handling remains the same
      const isWorkspace = target === workspace || target === newStage;
      const isTransformer = transformer.current && (target as any).getClassName?.() === 'Transformer';

      if (isWorkspace) {
        // Before clearing selection, stop any video playback
        if (selectedNode && editor.isVideoObject(selectedNode)) {
          const videoElement = selectedNode.getAttr('videoElement') as HTMLVideoElement;
          if (videoElement && !videoElement.paused) {
            videoElement.pause();
            selectedNode.setAttr('isPlaying', false);
          }
        }
        setSelectedNode(null);
        if (transformer.current) {
          transformer.current.nodes([]);
          transformer.current.remove();
        }
        clearSelectionCallback?.();
        return;
      }

      if (isTransformer) return;

      // Find the parent group if the target is a child (like an Image inside a video group)
      let nodeToSelect: Konva.Node = target;
      let targetLayer = target.getLayer();

      // First check if we clicked on a child of a video group
      if (target.parent instanceof Konva.Group && target.parent.getAttr('objectType') === 'video') {
        nodeToSelect = target.parent;
        targetLayer = nodeToSelect.getLayer();
      } 
      // Then check if we clicked directly on a video group
      else if (target instanceof Konva.Group && target.getAttr('objectType') === 'video') {
        nodeToSelect = target;
        targetLayer = nodeToSelect.getLayer();
      }
      // Finally check if we clicked on an image that is actually a video frame
      else if (target instanceof Konva.Image && target.parent?.getAttr('objectType') === 'video') {
        nodeToSelect = target.parent;
        targetLayer = nodeToSelect.getLayer();
      }

      // If we found a layer, set it as active
      if (targetLayer) {
        setActiveLayer(targetLayer);
      }

      // If we're selecting a video node, ensure its state is preserved
      if (nodeToSelect instanceof Konva.Group && nodeToSelect.getAttr('objectType') === 'video') {
        const videoElement = nodeToSelect.getAttr('videoElement') as HTMLVideoElement;
        if (videoElement) {
          // Ensure the video state is properly initialized
          if (nodeToSelect.getAttr('duration') === undefined) {
            nodeToSelect.setAttr('duration', videoElement.duration);
          }
          if (nodeToSelect.getAttr('startTime') === undefined) {
            nodeToSelect.setAttr('startTime', 0);
          }
          if (nodeToSelect.getAttr('endTime') === undefined) {
            nodeToSelect.setAttr('endTime', videoElement.duration);
          }
          if (nodeToSelect.getAttr('isPlaying') === undefined) {
            nodeToSelect.setAttr('isPlaying', !videoElement.paused);
          }
        }
      }

      console.log('Node to select:', {
        isGroup: nodeToSelect instanceof Konva.Group,
        objectType: nodeToSelect.getAttr('objectType'),
        hasVideoElement: nodeToSelect.getAttr('videoElement') instanceof HTMLVideoElement,
        className: nodeToSelect.getClassName(),
        layer: nodeToSelect.getLayer()?.name(),
        attrs: nodeToSelect.getAttrs()
      });

      if (nodeToSelect instanceof Konva.Group || nodeToSelect instanceof Konva.Shape || nodeToSelect instanceof Konva.Image) {
        setSelectedNode(nodeToSelect);
        if (transformer.current) {
          // Remove from previous layer if exists
          transformer.current.remove();
          // Add to target's layer
          nodeToSelect.getLayer()?.add(transformer.current);
          transformer.current.nodes([nodeToSelect]);
          transformer.current.moveToTop();
          nodeToSelect.getLayer()?.batchDraw();
        }
      }
    });

    setStage(newStage);
    setLayers(newLayers);
    setActiveLayer(emotesLayer); // Set emotes layer as active by default

    return () => {
      window.removeEventListener('resize', handleResize);
    };
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
    if (!layer || !stage) {
      console.warn('Layer or stage not ready');
      return;
    }

    try {
      // Set the new active layer
      setActiveLayer(layer);

      // Ensure all layers are visible and drawn
      stage.getLayers().forEach(l => {
        if (l) {
          l.visible(true);
          try {
            l.draw();
          } catch (e) {
            console.warn('Layer draw failed:', e);
          }
        }
      });

      // Move the active layer to top for proper stacking
      layer.moveToTop();

      // If there's a transformer, make sure it stays with its target
      if (transformer.current && transformer.current.nodes().length > 0) {
        const targetNode = transformer.current.nodes()[0];
        const targetLayer = targetNode?.getLayer();
        if (targetNode && targetLayer) {
          transformer.current.remove(); // Remove from current layer
          targetLayer.add(transformer.current); // Add to target's layer
          transformer.current.moveToTop();
          try {
            targetLayer.draw();
          } catch (e) {
            console.warn('Target layer draw failed:', e);
          }
        }
      }

      // Final draw to ensure everything is visible
      try {
        stage.draw();
      } catch (e) {
        console.warn('Stage draw failed:', e);
      }
    } catch (error) {
      console.error('Error in setActiveLayer:', error);
    }
  }, [stage, layers]);

  const addImage = useCallback(async (url: string) => {
    if (!stage) {
      console.error('Stage not initialized');
      return Promise.reject('Stage not initialized');
    }

    // Always use emotes layer for images
    const layer = layers.get('emotes') as Konva.Layer;
    setActiveLayer(layer);

    console.log('Creating new image with URL:', url);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    return new Promise<void>((resolve, reject) => {
      image.onload = () => {
        try {
          console.log('Image loaded successfully');
          const konvaImage = new Konva.Image({
            image: image,
            listening: true,
            imageSmoothingEnabled: false,
            pixelRatio: 1,
          });

          // Get current stage dimensions (this handles the dynamic canvas sizing)
          const stageWidth = stage.width();
          const stageHeight = stage.height();

          // Calculate scale to fit within stage (using 30% of stage size for emotes)
          const targetSize = Math.min(stageWidth, stageHeight) * 0.3;
          const scale = Math.min(
            targetSize / image.width,
            targetSize / image.height
          );

          // Round scale to nearest pixel for crisp rendering
          const roundedScale = Math.round(scale * 100) / 100;
          konvaImage.scale({ x: roundedScale, y: roundedScale });

          // Center the image within the stage
          konvaImage.position({
            x: (stageWidth - image.width * roundedScale) / 2,
            y: (stageHeight - image.height * roundedScale) / 2
          });

          // Add to layer and ensure it's visible
          layer.add(konvaImage);
          layer.moveToTop();
          layer.visible(true);
          
          // Make draggable after adding to layer
          konvaImage.draggable(true);

          try {
            // Draw all layers
            stage.getLayers().forEach(l => {
              if (l) {
                l.visible(true);
                l.draw();
              }
            });

            // Select the newly added image
            setSelectedNode(konvaImage);
            if (transformer.current) {
              // Remove transformer from current layer
              transformer.current.remove();
              // Add transformer to the same layer as the image
              layer.add(transformer.current);
              transformer.current.nodes([konvaImage]);
              transformer.current.moveToTop();
              // Force layer redraw
              layer.batchDraw();
            }

            saveToHistory();
            console.log('Image added to canvas successfully');
            resolve();
          } catch (e) {
            console.warn('Error drawing layers:', e);
            resolve(); // Still resolve since the image was added
          }
        } catch (error) {
          console.error('Error adding image to canvas:', error);
          reject(error);
        }
      };
      image.onerror = (error) => {
        console.error('Error loading image:', error);
        reject(new Error('Failed to load image'));
      };
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      image.src = proxyUrl;
    });
  }, [stage, layers, setSelectedNode, saveToHistory]);

  const editor: KonvaEditor = useMemo(() => ({
    stage,
    layers,
    activeLayer,
    selectedNode,
    history: history.current,
    currentPrompt,
    setCurrentPrompt,

    init,
    setStage,
    setActiveLayer: handleSetActiveLayer,
    addLayer,
    getLayer,
    setSelectedNode,

    addImage,

    addVideo: async (url: string) => {
      if (!activeLayer || !stage) {
        console.error('No layer or stage available');
        return Promise.reject('No layer or stage');
      }

      // Always use emotes layer for videos
      const layer = layers.get('emotes');
      if (!layer) {
        console.error('Emotes layer not found');
        return Promise.reject('Emotes layer not found');
      }
      setActiveLayer(layer);

      console.log('Creating new video with URL:', url);
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      // Use the video proxy route instead of the image proxy route
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(url)}`;
      video.src = proxyUrl;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;

      return new Promise<VideoObject>((resolve, reject) => {
        let metadataLoaded = false;
        let dataLoaded = false;

        // Create the group first without dimensions
        const group = new Konva.Group({
          draggable: true,
          listening: true,
          name: 'video-group',
          attrs: {
            objectType: 'video',
            videoElement: video,
            startTime: 0,
            endTime: 0,
            duration: 0,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            isPlaying: false
          }
        }) as VideoObject;

        // Add event listeners
        video.addEventListener('loadedmetadata', () => {
          metadataLoaded = true;
          checkReady();
        });

        video.addEventListener('loadeddata', () => {
          dataLoaded = true;
          checkReady();
        });

        const checkReady = () => {
          if (metadataLoaded && dataLoaded && video.duration) {
            try {
              // Calculate scale and dimensions now that we have video metadata
              const scale = Math.min(
                (stage.width() * 0.8) / video.videoWidth,
                (stage.height() * 0.8) / video.videoHeight
              );

              // Set group dimensions
              group.width(video.videoWidth * scale);
              group.height(video.videoHeight * scale);

              // Create and add the video image
              const konvaVideo = new Konva.Image({
                image: video,
                width: video.videoWidth,
                height: video.videoHeight,
                scaleX: scale,
                scaleY: scale,
                listening: true,
                // draggable: false
              });

              // Center the group
              group.position({
                x: (stage.width() - video.videoWidth * scale) / 2,
                y: (stage.height() - video.videoHeight * scale) / 2
              });

              group.add(konvaVideo);
              layer.add(group);

              // Create animation to update video frames
              const anim = new Konva.Animation(() => {
                layer.batchDraw();
                return true;
              }, layer);

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

              // Start animation and play video
              anim.start();
              video.play().catch(console.error);
              group.attrs.isPlaying = true;

              // Select the newly added video
              setSelectedNode(group);
              if (transformer.current) {
                // Remove transformer from current layer
                transformer.current.remove();
                // Add to the same layer as group
                layer.add(transformer.current);
                transformer.current.nodes([group]);
                transformer.current.moveToTop();
                // Force layer redraw
                layer.batchDraw();
              }

              // Save to history
              saveToHistory();
              
              console.log('Video added to canvas successfully');
              console.log('Video object type:', group.attrs.objectType);
              console.log('Is video object:', editor.isVideoObject(group));
              resolve(group);
            } catch (error) {
              reject(error);
            }
          }
        };

        video.load();
      });
    },

    isVideoObject: (node: Konva.Node): node is VideoObject => {
      if (!node) return false;
      
      // If the node is an Image, check its parent for video properties
      if (node instanceof Konva.Image && node.parent instanceof Konva.Group) {
        node = node.parent;
      }
      
      const isGroup = node instanceof Konva.Group;
      const objectType = node.getAttr('objectType');
      const videoElement = node.getAttr('videoElement');
      
      console.log('Checking if node is video object:', {
        isGroup,
        objectType,
        hasVideoElement: videoElement instanceof HTMLVideoElement,
        videoDuration: videoElement instanceof HTMLVideoElement ? videoElement.duration : 'N/A',
        attrs: node.getAttrs()
      });
      
      // If it's a video object but missing some attributes, reinitialize them
      if (isGroup && objectType === 'video') {
        const attrs = node.getAttrs();
        
        // Store the video URL if we have a video element
        if (videoElement instanceof HTMLVideoElement && !attrs.videoUrl) {
          attrs.videoUrl = videoElement.src;
        }
        
        // If we have a URL but no video element, recreate it
        if (attrs.videoUrl && !(videoElement instanceof HTMLVideoElement)) {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.src = attrs.videoUrl;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          attrs.videoElement = video;
        }
        
        const currentVideoElement = attrs.videoElement;
        if (currentVideoElement instanceof HTMLVideoElement) {
          // Store the duration in the node's attributes if not already set
          if (!attrs.duration && currentVideoElement.duration) {
            attrs.duration = currentVideoElement.duration;
          }
          
          // Use stored duration or video duration
          const duration = attrs.duration || currentVideoElement.duration || 0;
          
          // Initialize or restore time-related attributes
          if (attrs.startTime === undefined) {
            attrs.startTime = 0;
          }
          if (attrs.endTime === undefined || attrs.endTime === 0) {
            attrs.endTime = duration;
          }
          
          // Ensure these attributes exist with default values
          if (attrs.brightness === undefined) attrs.brightness = 100;
          if (attrs.contrast === undefined) attrs.contrast = 100;
          if (attrs.saturation === undefined) attrs.saturation = 100;
          if (attrs.isPlaying === undefined) attrs.isPlaying = !currentVideoElement.paused;
          
          // Update the node's attributes
          node.setAttrs(attrs);
          
          return true;
        }
      }
      
      return false;
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
        // Initial position - will be centered after adding to get proper dimensions
        x: 0,
        y: 0
      });

      // Add to layer first to get accurate text dimensions
      activeLayer.add(textNode);
      
      // Now center the text based on its actual dimensions
      const textWidth = textNode.width();
      const textHeight = textNode.height();
      
      textNode.position({
        x: (stage.width() - textWidth) / 2,
        y: (stage.height() - textHeight) / 2
      });
      
      // Select the newly added text
      setSelectedNode(textNode);
      if (transformer.current) {
        // Remove transformer from current layer
        transformer.current.remove();
        // Add transformer to the same layer as the text
        activeLayer.add(transformer.current);
        transformer.current.nodes([textNode]);
        transformer.current.moveToTop();
        // Force layer redraw
        activeLayer.batchDraw();
      }

      saveToHistory();
    },

    addShape: (type: ShapeType) => {
      if (!activeLayer || !stage) return;

      let shape: Konva.Shape;
      const stageCenter = {
        x: stage.width() / 2,
        y: stage.height() / 2
      };

      const commonConfig = {
        fill: editorState.fillColor,
        stroke: editorState.strokeColor,
        strokeWidth: editorState.strokeWidth,
        draggable: true,
        // Center position for all shapes
        x: stageCenter.x,
        y: stageCenter.y
      };

      switch (type) {
        case 'rectangle':
          shape = new Konva.Rect({
            ...commonConfig,
            width: 100,
            height: 100,
            // Offset position so rectangle is centered (not top-left corner at center)
            x: stageCenter.x - 50, // width / 2
            y: stageCenter.y - 50  // height / 2
          });
          break;
        case 'circle':
          shape = new Konva.Circle({
            ...commonConfig,
            radius: 50
            // Circle centers itself automatically
          });
          break;
        case 'triangle':
          shape = new Konva.RegularPolygon({
            ...commonConfig,
            sides: 3,
            radius: 50
            // RegularPolygon centers itself automatically
          });
          break;
        case 'diamond':
          shape = new Konva.RegularPolygon({
            ...commonConfig,
            sides: 4,
            radius: 50,
            rotation: 45
            // RegularPolygon centers itself automatically
          });
          break;
        case 'inverseTriangle':
          shape = new Konva.RegularPolygon({
            ...commonConfig,
            sides: 3,
            radius: 50,
            rotation: 180
            // RegularPolygon centers itself automatically
          });
          break;
      }

      activeLayer.add(shape);
      
      // Select the newly added shape
      setSelectedNode(shape);
      if (transformer.current) {
        // Remove transformer from current layer
        transformer.current.remove();
        // Add transformer to the same layer as the shape
        activeLayer.add(transformer.current);
        transformer.current.nodes([shape]);
        transformer.current.moveToTop();
        // Force layer redraw
        activeLayer.batchDraw();
      }

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
      if (!stage) return Promise.reject("Stage is not initialized");
      
      // Store current transformer state
      const currentTransformers = stage.find('Transformer');
      const transformerStates = currentTransformers.map(tr => ({
        transformer: tr,
        visible: tr.visible(),
        nodes: (tr as Konva.Transformer).nodes()
      }));

      // Hide all transformers
      currentTransformers.forEach(tr => tr.hide());
      
      // Get the original stage image at full size
      const dataURL = stage.toDataURL({
        pixelRatio: 1
      });
      
      // Restore transformer state
      transformerStates.forEach(state => {
        state.transformer.visible(state.visible);
        if (state.transformer instanceof Konva.Transformer) {
          state.transformer.nodes(state.nodes);
        }
      });
      stage.batchDraw();

      // Download the image with prompt-based filename
      const link = document.createElement('a');
      link.download = editor.formatFilename("512x512");
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return Promise.resolve();
    },
    
    downloadForDiscord: () => {
      if (!stage) return Promise.reject("Stage is not initialized");
      
      // Store current transformer state and stage properties
      const currentTransformers = stage.find('Transformer');
      const transformerStates = currentTransformers.map(tr => ({
        transformer: tr,
        visible: tr.visible(),
        nodes: (tr as Konva.Transformer).nodes()
      }));
      
      // Get the original stage dimensions
      const originalWidth = stage.width();
      const originalHeight = stage.height();
      const originalScale = stage.scale();
      
      // Hide all transformers
      currentTransformers.forEach(tr => tr.hide());
      
      // Create a temporary in-memory canvas to do the scaling
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 128;
      tempCanvas.height = 128;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        return Promise.reject("Could not create canvas context");
      }
      
      // Get the stage as an image
      const dataURL = stage.toDataURL({
        pixelRatio: 1
      });
      
      // Create an image from the data URL
      const img = new Image();
      img.src = dataURL;
      
      // Return a promise that resolves when the image is loaded and processed
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Clear the temporary canvas
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Draw the image on the temporary canvas, preserving aspect ratio
          const scale = Math.min(128 / img.width, 128 / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (128 - scaledWidth) / 2;
          const offsetY = (128 - scaledHeight) / 2;
          
          // Draw with proper centering
          tempCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
          
          // Get the data URL from the temporary canvas
          const scaledDataURL = tempCanvas.toDataURL('image/png');
          
          // Restore transformer state
          transformerStates.forEach(state => {
            state.transformer.visible(state.visible);
            if (state.transformer instanceof Konva.Transformer) {
              state.transformer.nodes(state.nodes);
            }
          });
          stage.batchDraw();
          
          // Download the image with prompt-based filename
          const link = document.createElement('a');
          link.download = editor.formatFilename("discord_128x128");
          link.href = scaledDataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          resolve();
        };
        
        img.onerror = () => {
          reject("Failed to load stage image");
        };
      });
    },
    
    downloadForTwitchSmall: () => {
      if (!stage) return Promise.reject("Stage is not initialized");
      
      // Store current transformer state and stage properties
      const currentTransformers = stage.find('Transformer');
      const transformerStates = currentTransformers.map(tr => ({
        transformer: tr,
        visible: tr.visible(),
        nodes: (tr as Konva.Transformer).nodes()
      }));
      
      // Get the original stage dimensions
      const originalWidth = stage.width();
      const originalHeight = stage.height();
      const originalScale = stage.scale();
      
      // Hide all transformers
      currentTransformers.forEach(tr => tr.hide());
      
      // Create a temporary in-memory canvas to do the scaling
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 28;
      tempCanvas.height = 28;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        return Promise.reject("Could not create canvas context");
      }
      
      // Get the stage as an image
      const dataURL = stage.toDataURL({
        pixelRatio: 1
      });
      
      // Create an image from the data URL
      const img = new Image();
      img.src = dataURL;
      
      // Return a promise that resolves when the image is loaded and processed
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Clear the temporary canvas
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Draw the image on the temporary canvas, preserving aspect ratio
          const scale = Math.min(28 / img.width, 28 / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (28 - scaledWidth) / 2;
          const offsetY = (28 - scaledHeight) / 2;
          
          // Draw with proper centering
          tempCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
          
          // Get the data URL from the temporary canvas
          const scaledDataURL = tempCanvas.toDataURL('image/png');
          
          // Restore transformer state
          transformerStates.forEach(state => {
            state.transformer.visible(state.visible);
            if (state.transformer instanceof Konva.Transformer) {
              state.transformer.nodes(state.nodes);
            }
          });
          stage.batchDraw();
          
          // Download the image with prompt-based filename
          const link = document.createElement('a');
          link.download = editor.formatFilename("twitch_28x28");
          link.href = scaledDataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          resolve();
        };
        
        img.onerror = () => {
          reject("Failed to load stage image");
        };
      });
    },
    
    downloadForTwitchMedium: () => {
      if (!stage) return Promise.reject("Stage is not initialized");
      
      // Store current transformer state and stage properties
      const currentTransformers = stage.find('Transformer');
      const transformerStates = currentTransformers.map(tr => ({
        transformer: tr,
        visible: tr.visible(),
        nodes: (tr as Konva.Transformer).nodes()
      }));
      
      // Get the original stage dimensions
      const originalWidth = stage.width();
      const originalHeight = stage.height();
      const originalScale = stage.scale();
      
      // Hide all transformers
      currentTransformers.forEach(tr => tr.hide());
      
      // Create a temporary in-memory canvas to do the scaling
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 56;
      tempCanvas.height = 56;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        return Promise.reject("Could not create canvas context");
      }
      
      // Get the stage as an image
      const dataURL = stage.toDataURL({
        pixelRatio: 1
      });
      
      // Create an image from the data URL
      const img = new Image();
      img.src = dataURL;
      
      // Return a promise that resolves when the image is loaded and processed
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Clear the temporary canvas
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Draw the image on the temporary canvas, preserving aspect ratio
          const scale = Math.min(56 / img.width, 56 / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (56 - scaledWidth) / 2;
          const offsetY = (56 - scaledHeight) / 2;
          
          // Draw with proper centering
          tempCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
          
          // Get the data URL from the temporary canvas
          const scaledDataURL = tempCanvas.toDataURL('image/png');
          
          // Restore transformer state
          transformerStates.forEach(state => {
            state.transformer.visible(state.visible);
            if (state.transformer instanceof Konva.Transformer) {
              state.transformer.nodes(state.nodes);
            }
          });
          stage.batchDraw();
          
          // Download the image with prompt-based filename
          const link = document.createElement('a');
          link.download = editor.formatFilename("twitch_56x56");
          link.href = scaledDataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          resolve();
        };
        
        img.onerror = () => {
          reject("Failed to load stage image");
        };
      });
    },
    
    downloadForTwitchLarge: () => {
      if (!stage) return Promise.reject("Stage is not initialized");
      
      // Store current transformer state and stage properties
      const currentTransformers = stage.find('Transformer');
      const transformerStates = currentTransformers.map(tr => ({
        transformer: tr,
        visible: tr.visible(),
        nodes: (tr as Konva.Transformer).nodes()
      }));
      
      // Get the original stage dimensions
      const originalWidth = stage.width();
      const originalHeight = stage.height();
      const originalScale = stage.scale();
      
      // Hide all transformers
      currentTransformers.forEach(tr => tr.hide());
      
      // Create a temporary in-memory canvas to do the scaling
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 112;
      tempCanvas.height = 112;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        return Promise.reject("Could not create canvas context");
      }
      
      // Get the stage as an image
      const dataURL = stage.toDataURL({
        pixelRatio: 1
      });
      
      // Create an image from the data URL
      const img = new Image();
      img.src = dataURL;
      
      // Return a promise that resolves when the image is loaded and processed
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Clear the temporary canvas
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Draw the image on the temporary canvas, preserving aspect ratio
          const scale = Math.min(112 / img.width, 112 / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (112 - scaledWidth) / 2;
          const offsetY = (112 - scaledHeight) / 2;
          
          // Draw with proper centering
          tempCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
          
          // Get the data URL from the temporary canvas
          const scaledDataURL = tempCanvas.toDataURL('image/png');
          
          // Restore transformer state
          transformerStates.forEach(state => {
            state.transformer.visible(state.visible);
            if (state.transformer instanceof Konva.Transformer) {
              state.transformer.nodes(state.nodes);
            }
          });
          stage.batchDraw();
          
          // Download the image with prompt-based filename
          const link = document.createElement('a');
          link.download = editor.formatFilename("twitch_112x112");
          link.href = scaledDataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          resolve();
        };
        
        img.onerror = () => {
          reject("Failed to load stage image");
        };
      });
    },

    downloadAsGif: async () => {
      if (!stage || !selectedNode) return;
      
      try {
        // Create a GIF encoder
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: stage.width(),
          height: stage.height(),
          workerScript: '/gif.worker.js'
        });

        // Store current transformer state and hide it
        const currentTransformers = stage.find('Transformer');
        currentTransformers.forEach(tr => tr.hide());
        stage.batchDraw();

        // Capture frames for 2 seconds (60fps = 120 frames)
        const frames = 120;
        const animation = selectedNode.getAttr('animation');
        
        if (!animation) {
          console.warn('No animation found on selected node');
          return;
        }

        // Add frames to the GIF
        for (let i = 0; i < frames; i++) {
          // Get the current frame as an image
          const dataUrl = stage.toDataURL();
          const img = document.createElement('img');
          img.src = dataUrl;
          
          await new Promise(resolve => {
            img.onload = () => {
              gif.addFrame(img, { delay: 1000 / 60 }); // 60fps
              resolve(null);
            };
          });

          // Wait for next animation frame
          await new Promise(resolve => requestAnimationFrame(resolve));
        }

        // Restore transformer state
        currentTransformers.forEach(tr => tr.show());
        stage.batchDraw();

        // Return a promise that resolves when the file is downloaded
        return new Promise<void>((resolve, reject) => {
          gif.on('finished', (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'animated-emote.gif';
            link.href = url;
            document.body.appendChild(link);
            
            // Click the link to start the download
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            // Resolve immediately after initiating download
            resolve();
          });

          gif.render();
        });
      } catch (error) {
        console.error('Error creating GIF:', error);
        throw error;
      }
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

    saveEmote: async (prompt: string, userId: string): Promise<Emote | undefined> => {
      if (!stage) return undefined;
      
      try {
        let imageUrl: string;
        let isVideo = false;

        // Check if we're saving a video
        if (selectedNode && editor.isVideoObject(selectedNode)) {
          const attrs = selectedNode.getAttrs();
          if (!attrs.videoUrl) {
            throw new Error('Video URL not found');
          }
          imageUrl = attrs.videoUrl;
          isVideo = true;
        } else {
          // Store current transformer state
          const currentTransformers = stage.find('Transformer');
          const transformerStates = currentTransformers.map(tr => ({
            transformer: tr,
            visible: tr.visible(),
            nodes: (tr as Konva.Transformer).nodes()
          }));

          // Hide all transformers
          currentTransformers.forEach(tr => tr.hide());
          stage.batchDraw();

          // Generate the image without transformers visible
          imageUrl = stage.toDataURL();

          // Restore transformer state
          transformerStates.forEach(state => {
            state.transformer.visible(state.visible);
            if (state.transformer instanceof Konva.Transformer) {
              state.transformer.nodes(state.nodes);
            }
          });
          stage.batchDraw();
        }

        const response = await axios.post<Emote>('/api/saveemote', {
          prompt,
          imageUrl,
          style: "custom",
          model: "canvas",
          isVideo
        });

        if (response.status !== 200) {
          throw new Error('Failed to save emote');
        }

        toast.success('Emote saved successfully!');
        return response.data;
      } catch (error) {
        console.error('Failed to save emote:', error);
        toast.error('Failed to save emote: ' + (error instanceof Error ? error.message : 'Unknown error'));
        return undefined;
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
        
        // Store the current position and scale of the selected node
        const currentAttrs = {
          x: selectedNode.x(),
          y: selectedNode.y(),
          scaleX: selectedNode.scaleX(),
          scaleY: selectedNode.scaleY(),
          rotation: selectedNode.rotation()
        };

        // Remove the old image
        selectedNode.destroy();
        
        // Load the new image
        const image = await loadImage(response.data.image.url);
        const newImage = new Konva.Image({
          image,
          draggable: true,
          ...currentAttrs // Apply the same position and scale as the old image
        });

        // Add the new image to the active layer
        if (activeLayer) {
          activeLayer.add(newImage);
          
          // Ensure the layer is visible
          activeLayer.visible(true);
          
          // Draw all layers to ensure everything is visible
          stage?.getLayers().forEach(layer => {
            layer.visible(true);
            layer.draw();
          });

          // Select the new image
          setSelectedNode(newImage);
          if (transformer.current) {
            transformer.current.nodes([newImage]);
            transformer.current.moveToTop();
          }

          // Save to history
          saveToHistory();
        }

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
          // Remove transformer from current layer
          transformer.current.remove();
          // Add transformer to the same layer as the image
          activeLayer.add(transformer.current);
          transformer.current.nodes([imageNode]);
          transformer.current.moveToTop();
          // Force layer redraw
          activeLayer.batchDraw();
        }

        return Promise.resolve();
      } catch (error) {
        console.error('Error adding generated emote:', error);
        return Promise.reject(error);
      }
    },

    // Add these methods to the editor object
    getVideoStartTime: () => {
      if (!selectedNode) return 0;
      
      // If we have an Image that's part of a video group, use the parent
      const videoNode = selectedNode instanceof Konva.Image && selectedNode.parent?.getAttr('objectType') === 'video' 
        ? selectedNode.parent 
        : selectedNode;
        
      if (!editor.isVideoObject(videoNode)) return 0;
      return videoNode.attrs.startTime || 0;
    },

    getVideoEndTime: () => {
      if (!selectedNode) return 0;
      
      // If we have an Image that's part of a video group, use the parent
      const videoNode = selectedNode instanceof Konva.Image && selectedNode.parent?.getAttr('objectType') === 'video' 
        ? selectedNode.parent 
        : selectedNode;
        
      if (!editor.isVideoObject(videoNode)) return 0;
      return videoNode.attrs.endTime || videoNode.attrs.duration || 0;
    },

    getVideoDuration: () => {
      if (!selectedNode) return 0;
      
      // If we have an Image that's part of a video group, use the parent
      const videoNode = selectedNode instanceof Konva.Image && selectedNode.parent?.getAttr('objectType') === 'video' 
        ? selectedNode.parent 
        : selectedNode;
        
      if (!editor.isVideoObject(videoNode)) return 0;
      return videoNode.attrs.duration || 0;
    },

        downloadTrimmedVideo: async () => {
      if (!selectedNode) return;
      
      const videoNode = selectedNode instanceof Konva.Image && selectedNode.parent?.getAttr('objectType') === 'video' 
        ? selectedNode.parent 
        : selectedNode;
        
      if (!editor.isVideoObject(videoNode)) return;
      
      const videoUrl = videoNode.attrs.videoUrl;
      const startTime = videoNode.attrs.startTime || 0;
      const endTime = videoNode.attrs.endTime || videoNode.attrs.duration || 0;
      
      if (!videoUrl || startTime >= endTime) {
        console.error('Invalid video parameters for trimming');
        return;
      }

      console.log('🎬 Video Trim Request:', {
        videoUrl,
        startTime: `${startTime.toFixed(3)}s`,
        endTime: `${endTime.toFixed(3)}s`,
        duration: `${(endTime - startTime).toFixed(3)}s`
      });

      // For now, provide a simple solution: download with trim info in filename
      // This is much more reliable than complex client-side video processing
      try {
        const duration = endTime - startTime;
        const filename = `video_${startTime.toFixed(1)}s-${endTime.toFixed(1)}s_${duration.toFixed(1)}s.mp4`;
        
        console.log(`📥 Downloading original video as: ${filename}`);
        console.log(`ℹ️  Manual trim needed: ${startTime.toFixed(3)}s to ${endTime.toFixed(3)}s`);
        
        // Extract original URL from proxy if needed
        let originalUrl = videoUrl;
        if (videoUrl.includes('?url=')) {
          originalUrl = decodeURIComponent(videoUrl.split('?url=')[1]);
        }
        
        // Download the original video with trim information in filename
        const a = document.createElement('a');
        a.href = originalUrl;
        a.download = filename;
        a.click();
        
        // Show user-friendly message with trim instructions
        alert(`📥 Video downloaded as: ${filename}\n\n` +
              `⏱️ Trim manually from ${startTime.toFixed(3)}s to ${endTime.toFixed(3)}s\n` +
              `📏 Expected duration: ${duration.toFixed(3)} seconds\n\n` +
              `💡 Use any video editor to trim to these exact timestamps.`);
        
      } catch (error) {
        console.error('❌ Video download failed:', error);
        alert('Failed to download video. Please try again.');
      }
    },

    getTrimmedVideoUrl: async () => {
      if (!selectedNode || !editor.isVideoObject(selectedNode)) {
        throw new Error('No video selected');
      }

      const video = selectedNode.getAttr('videoElement') as HTMLVideoElement;
      return video.src;
    },

    setAnimation: (node: Konva.Node, animation: AnimationConfig | null) => {
      if (!node) return;

      // Stop any existing animations
      const existingTweens = nodeTweens.get(node) || [];
      existingTweens.forEach(tween => tween.destroy());
      nodeTweens.set(node, []);
      node.clearCache();

      if (!animation) {
        node.setAttr('animation', null);
        return;
      }

      node.setAttr('animation', animation);
      
      // Apply the animation
      const duration = 2 / animation.speed;
      const newTweens: Konva.Tween[] = [];

      switch (animation.type) {
        case 'shake': {
          const tween = new Konva.Tween({
            node,
            duration,
            x: node.x() + 10,
            yoyo: true,
            repeat: -1,
          });
          newTweens.push(tween);
          tween.play();
          break;
        }
        case 'spin': {
          const tween = new Konva.Tween({
            node,
            duration,
            rotation: 360,
            repeat: -1,
          });
          newTweens.push(tween);
          tween.play();
          break;
        }
        case 'bounce': {
          const tween = new Konva.Tween({
            node,
            duration,
            y: node.y() - 20,
            yoyo: true,
            repeat: -1,
          });
          newTweens.push(tween);
          tween.play();
          break;
        }
        case 'zoom': {
          const tween = new Konva.Tween({
            node,
            duration,
            scaleX: node.scaleX() * 1.2,
            scaleY: node.scaleY() * 1.2,
            yoyo: true,
            repeat: -1,
          });
          newTweens.push(tween);
          tween.play();
          break;
        }
        case 'slide': {
          const tween = new Konva.Tween({
            node,
            duration,
            x: node.x() + 40,
            yoyo: true,
            repeat: -1,
          });
          newTweens.push(tween);
          tween.play();
          break;
        }
        case 'flip': {
          const tween = new Konva.Tween({
            node,
            duration,
            scaleX: -node.scaleX(),
            yoyo: true,
            repeat: -1,
          });
          newTweens.push(tween);
          tween.play();
          break;
        }
        case 'pet':
          // Pet animation is handled separately with an overlay
          break;
      }

      // Store the new tweens
      nodeTweens.set(node, newTweens);
      activeLayer?.batchDraw();
    },

    stopAnimation: (node: Konva.Node) => {
      if (!node) return;
      const tweens = nodeTweens.get(node) || [];
      tweens.forEach(tween => tween.destroy());
      nodeTweens.set(node, []);
      node.clearCache();
      activeLayer?.batchDraw();
    },

    getAnimation: (node: Konva.Node) => {
      if (!node) return null;
      return node.getAttr('animation');
    },

    playAnimation: (node: Konva.Node) => {
      if (!node) return;
      const animation = node.getAttr('animation');
      if (animation) {
        editor.setAnimation(node, animation);
      }
    },

    setVideoStartTime: (time: number) => {
      if (!selectedNode) return;
      
      // If we have an Image that's part of a video group, use the parent
      const videoNode = selectedNode instanceof Konva.Image && selectedNode.parent?.getAttr('objectType') === 'video' 
        ? selectedNode.parent 
        : selectedNode;
        
      if (!editor.isVideoObject(videoNode)) return;
      const video = videoNode.getAttr('videoElement') as HTMLVideoElement;
      if (!video || !video.duration) return;
      const newTime = Math.max(0, Math.min(time, video.duration));
      videoNode.attrs.startTime = newTime;
      if (video.currentTime < newTime) {
        video.currentTime = newTime;
      }
      activeLayer?.batchDraw();
      
      // Trigger a state update to reflect the change
      if (selectedNode === videoNode) {
        // Clone the node to trigger attribute change detection
        const updatedNode = videoNode.clone();
        setSelectedNode(updatedNode);
        setSelectedNode(videoNode);
      }
    },

    setVideoEndTime: (time: number) => {
      if (!selectedNode) return;
      
      // If we have an Image that's part of a video group, use the parent
      const videoNode = selectedNode instanceof Konva.Image && selectedNode.parent?.getAttr('objectType') === 'video' 
        ? selectedNode.parent 
        : selectedNode;
        
      if (!editor.isVideoObject(videoNode)) return;
      const video = videoNode.getAttr('videoElement') as HTMLVideoElement;
      if (!video || !video.duration) return;
      const newTime = Math.max(videoNode.attrs.startTime, Math.min(time, video.duration));
      videoNode.attrs.endTime = newTime;
      if (video.currentTime > newTime) {
        video.currentTime = videoNode.attrs.startTime;
      }
      activeLayer?.batchDraw();
      
      // Trigger a state update to reflect the change
      if (selectedNode === videoNode) {
        // Clone the node to trigger attribute change detection
        const updatedNode = videoNode.clone();
        setSelectedNode(updatedNode);
        setSelectedNode(videoNode);
      }
    },

    formatFilename: (dimensions: string): string => {
      // Create a safe filename from the prompt
      let filename = currentPrompt || "emote";
      
      // Replace invalid filename characters
      filename = filename.replace(/[^\w\s-]/g, "");
      
      // Trim whitespace and replace spaces with underscores
      filename = filename.trim().replace(/\s+/g, "_");
      
      // Truncate to reasonable length (40 characters max)
      if (filename.length > 40) {
        filename = filename.substring(0, 40);
      }
      
      // Add dimensions and extension
      return `${filename}_${dimensions}.png`;
    },
  }), [
    stage, 
    layers, 
    activeLayer, 
    selectedNode,
    currentPrompt,
    init, 
    addLayer, 
    getLayer,
    handleSetActiveLayer,
    addImage,
    editorState.fillColor,
    editorState.fontFamily,
    editorState.fontSize,
    editorState.strokeColor,
    editorState.strokeWidth,
    restoreSelection,
    saveSelection,
    saveToHistory
  ]);

  return { editor, init };
};