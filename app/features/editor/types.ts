import { Emote } from "@prisma/client";
import Konva from 'konva';

export type WorkspaceType = 'image' | 'video';

export type ActiveTool = 
  | "select"
  | "draw"
  | "eraser"
  | "text"
  | "shapes"
  | "emotes"
  | "emote-generator"
  | "video-controls"
  | "video-settings"
  | "video-generator"
  | "fill"
  | "stroke"
  | "stroke-width"
  | "opacity"
  | "font"
  | "filter"
  | "enhance"
  | "inpaint"
  | "images";

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'inverseTriangle';

export type FilterType = 'none' | 'grayscale' | 'sepia' | 'invert' | 'blur' | 'brightness' | 'contrast' | 'saturation' | 'hue-rotate' | 'vintage' | 'pixelate';

export const filters: FilterType[] = [
  "none",
  "grayscale",
  "sepia",
  "invert",
  "blur",
  "brightness",
  "contrast",
  "saturation",
  "hue-rotate",
  "vintage",
  "pixelate"
];

export const colors = [
  '#FF0000', // Red
  '#FF4500', // Orange Red
  '#FFA500', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#00FFFF', // Cyan
  '#0000FF', // Blue
  '#8A2BE2', // Blue Violet
  '#FF00FF', // Magenta
  '#FFC0CB', // Pink
  '#FFFFFF', // White
  '#000000', // Black
  '#808080', // Gray
  '#A52A2A', // Brown
  '#FFD700', // Gold
  '#C0C0C0'  // Silver
];

export interface KonvaNode extends Konva.Node {
  videoObject?: VideoObject;
}

export interface VideoObject extends Konva.Group {
  attrs: {
    objectType: 'video';
    videoElement: HTMLVideoElement;
    startTime: number;
    endTime: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    isPlaying?: boolean;
  };
  getVideoElement(): HTMLVideoElement;
  play(): void;
  pause(): void;
  setStartTime(time: number): void;
  setEndTime(time: number): void;
  getDuration(): number;
  getCurrentTime(): number;
  setCurrentTime(time: number): void;
}

export interface VideoModelOption {
  name: string;
  type: 'select' | 'number';
  default: string | number;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface VideoGenerationModel {
  id: string;
  name: string;
  description: string;
  apiRoute: string;
  options: VideoModelOption[];
}

export interface VideoGeneration {
  models: VideoGenerationModel[];
}

export const videoGeneration: VideoGeneration = {
  models: [
    {
      id: 'default',
      name: 'Default',
      description: 'Standard video generation model',
      apiRoute: '/api/video/generate',
      options: [
        {
          name: 'duration',
          type: 'number',
          default: 5,
          min: 1,
          max: 30,
          step: 1
        },
        {
          name: 'ratio',
          type: 'select',
          default: '16:9',
          options: ['16:9', '4:3', '1:1', '9:16']
        }
      ]
    }
  ]
};

export interface GenerationModel {
  id: string;
  name: string;
  description: string;
  apiRoute: string;
}

export interface Generation {
  models: GenerationModel[];
}

export const generation: Generation = {
  models: [
    {
      id: 'dalle3',
      name: 'DALL-E 3',
      description: 'Latest DALL-E model with high quality and accuracy',
      apiRoute: '/api/models/dalle3'
    },
    {
      id: 'dalle2',
      name: 'DALL-E 2',
      description: 'Previous generation DALL-E model',
      apiRoute: '/api/models/dalle2'
    },
    {
      id: 'sdxl',
      name: 'Stable Diffusion XL',
      description: 'Latest Stable Diffusion model',
      apiRoute: '/api/models/sdxl'
    },
    {
      id: 'kandinsky',
      name: 'Kandinsky',
      description: 'Kandinsky image generation model',
      apiRoute: '/api/models/kandinsky'
    },
    {
      id: 'img2img',
      name: 'Image to Image',
      description: 'Transform existing images',
      apiRoute: '/api/models/img2img'
    }
  ]
};

export interface KonvaEditor {
  stage: Konva.Stage | null;
  layer: Konva.Layer | null;
  selectedNode: Konva.Node | null;
  history: {
    undoStack: Konva.Node[][];
    redoStack: Konva.Node[][];
  };
  init: (container: HTMLDivElement, workspaceType: WorkspaceType) => void;
  setStage: (stage: Konva.Stage | null) => void;
  setLayer: (layer: Konva.Layer | null) => void;
  setSelectedNode: (node: Konva.Node | null) => void;
  addImage: (url: string) => Promise<void>;
  addVideo: (url: string) => Promise<VideoObject>;
  addText: (text: string, options?: KonvaTextOptions) => void;
  addShape: (type: ShapeType) => void;
  removeSelected: () => void;
  clear: () => void;
  download: () => void;
  undo: () => void;
  redo: () => void;
  enableDrawingMode: () => void;
  disableDrawingMode: () => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setOpacity: (opacity: number) => void;
  bringForward: () => void;
  sendBackward: () => void;
  getActiveObject: () => Konva.Node | null;
  getActiveObjects: () => Konva.Node[];
  getActiveImageUrl: () => string;
  saveEmote: (prompt: string, userId: string) => Promise<Emote | undefined>;
  inpaint: (prompt: string, maskUrl: string) => Promise<void>;
  removeBackground: () => Promise<void>;
  isVideoObject: (node: Konva.Node) => node is VideoObject;
  // Mask-related methods
  generateMaskUrl: () => string;
  startDrawingMask: () => void;
  clearMask: () => void;
  // Video-specific methods
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setBrightness: (value: number) => void;
  setContrast: (value: number) => void;
  setSaturation: (value: number) => void;
  getVolume: () => number;
  getPlaybackRate: () => number;
  getBrightness: () => number;
  getContrast: () => number;
  getSaturation: () => number;
  // Filter methods
  changeImageFilter: (filter: FilterType) => void;
  addGeneratedEmote: (url: string) => Promise<void>;
  setVideoStartTime: (time: number) => void;
  setVideoEndTime: (time: number) => void;
  getVideoStartTime: () => number;
  getVideoEndTime: () => number;
  getVideoDuration: () => number;
  downloadTrimmedVideo: () => Promise<void>;
}

export interface KonvaTextOptions {
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  align?: string;
  width?: number;
  fontWeight?: number | string;
}

export interface EditorState {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  fontFamily: string;
  fontSize: number;
  opacity: number;
}

export const DEFAULT_WORKSPACE_CONFIGS = {
  image: {
    width: 800,
    height: 800,
    backgroundColor: '#ffffff'
  },
  video: {
    width: 800,
    height: 800,
    backgroundColor: '#000000'
  }
} as const;

export const DEFAULT_EDITOR_STATE: EditorState = {
  fillColor: '#000000',
  strokeColor: '#000000',
  strokeWidth: 2,
  fontFamily: 'Arial',
  fontSize: 24,
  opacity: 1
} as const;

// Add type guard for Konva.Node
export function isKonvaNode(node: any): node is Konva.Node {
  return node instanceof Konva.Node;
}

// Add type guard for Konva.Shape
export function isKonvaShape(node: any): node is Konva.Shape {
  return node instanceof Konva.Shape;
}

// Add type guard for Konva.Group
export function isKonvaGroup(node: any): node is Konva.Group {
  return node instanceof Konva.Group;
}

// Add type guard for Konva.Stage
export function isKonvaStage(node: any): node is Konva.Stage {
  return node instanceof Konva.Stage;
}

// Add type guard for Konva.Transformer
export function isKonvaTransformer(node: any): node is Konva.Transformer {
  return node instanceof Konva.Transformer;
}

// Enhancement types
export type SelectOption = {
  type: "select";
  name: string;
  values: string[];
  default: string;
};

export type BooleanOption = {
  type: "boolean";
  name: string;
  default: boolean;
};

export type NumberOption = {
  type: "number";
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
};

export type StringOption = {
  type: "string";
  name: string;
  default: string;
};

export type ModelOption = SelectOption | BooleanOption | NumberOption | StringOption;

export interface EnhancementModel {
  name: string;
  description: string;
  apiRoute: string;
  options: ModelOption[];
}

export interface Enhancement {
  models: EnhancementModel[];
}

export const enhancement: Enhancement = {
  models: [
    {
      name: "Real-ESRGAN",
      description: "General purpose image upscaler",
      apiRoute: "/api/enhance/real-esrgan",
      options: [
        {
          type: "select",
          name: "upscaling_factor",
          values: ["2", "3", "4"],
          default: "4"
        },
        {
          type: "boolean",
          name: "overlapping_tiles",
          default: true
        }
      ]
    },
    {
      name: "Clarity Upscaler",
      description: "AI-powered image enhancement",
      apiRoute: "/api/enhance/clarity",
      options: [
        {
          type: "number",
          name: "upscale_factor",
          min: 1,
          max: 4,
          step: 0.5,
          default: 2
        },
        {
          type: "number",
          name: "resemblance",
          min: 0,
          max: 1,
          step: 0.1,
          default: 0.6
        },
        {
          type: "string",
          name: "prompt",
          default: "masterpiece, best quality, highres"
        }
      ]
    }
  ]
};

// Add these constants before the Enhancement types
export const fonts = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Roboto',
  'Open Sans',
  'Lato'
];

export const STROKE_WIDTH = [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20];

export const STROKE_DASH_ARRAY = [
  [], // Solid line
  [5, 5], // Dashed
  [2, 2], // Dotted
  [10, 5], // Long dash
  [5, 5, 2, 5], // Dash-dot
  [10, 5, 2, 5], // Long dash-dot
];

// Rename KonvaEditor to Editor for consistency
export type Editor = KonvaEditor;

// Add VideoEditor interface
export interface VideoEditor {
  addVideo: (url: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unmute: () => void;
  isMuted: () => boolean;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  setLoop: (value: boolean) => void;
  getLoop: () => boolean;
  setAutoplay: (value: boolean) => void;
  getAutoplay: () => boolean;
  setPoster: (url: string) => void;
  getPoster: () => string;
  setCurrentTime: (time: number) => void;
  setStartTime: (time: number) => void;
  setEndTime: (time: number) => void;
  getStartTime: () => number;
  getEndTime: () => number;
  trim: (start: number, end: number) => void;
  crop: (x: number, y: number, width: number, height: number) => void;
  resize: (width: number, height: number) => void;
  rotate: (angle: number) => void;
  flip: (horizontal: boolean, vertical: boolean) => void;
  setFilter: (value: string) => void;
  getFilter: () => string;
  setBrightness: (value: number) => void;
  getBrightness: () => number;
  setContrast: (value: number) => void;
  getContrast: () => number;
  setSaturation: (value: number) => void;
  getSaturation: () => number;
  setHue: (value: number) => void;
  getHue: () => number;
  setBlur: (value: number) => void;
  getBlur: () => number;
  setSharpen: (value: number) => void;
  getSharpen: () => number;
  setNoise: (value: number) => void;
  getNoise: () => number;
  setSepia: (value: number) => void;
  getSepia: () => number;
  setGrayscale: (value: number) => void;
  getGrayscale: () => number;
  setInvert: (value: number) => void;
  getInvert: () => number;
  setOpacity: (value: number) => void;
  getOpacity: () => number;
  save: () => Promise<string>;
  load: (data: string) => void;
  exportMP4: () => Promise<string>;
  exportWEBM: () => Promise<string>;
  exportGIF: () => Promise<string>;
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
  trigger: (event: string) => void;
  destroy: () => void;
}