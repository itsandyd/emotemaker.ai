import { Emote } from "@prisma/client";
import { fabric } from "fabric"
import { ITextOptions } from "fabric/fabric-impl";

import * as material from "material-colors"

// First, declare the fabric module extensions
declare module 'fabric/fabric-impl' {
    interface IImageOptions {
        objectType?: string;
        startTime?: number;
        endTime?: number;
    }

    interface Image {
        startTime?: number;
        endTime?: number;
    }
}

// Then define the VideoObject interface
export interface VideoObject extends fabric.Image {
    startTime: number;
    endTime: number;
    objectType: 'video';
    getElement(): HTMLVideoElement;
    scaleX: number;
    scaleY: number;
    width: number;
    height: number;
    left: number;
    top: number;
}

// Add these type definitions at the top of the file
type BaseOption = {
    name: string;
    type: string;
};

export type SelectOption = BaseOption & {
    type: "select";
    values: readonly string[];
    default: string;
};

export type BooleanOption = BaseOption & {
    type: "boolean";
    default: boolean;
};

export type NumberOption = BaseOption & {
    type: "number";
    min: number;
    max: number;
    step: number;
    default: number;
};

export type StringOption = BaseOption & {
    type: "string";
    default: string;
};

export const fonts = [
    "Arial",
    "Arial Black",
    "Verdana",
    "Helvetica",
    "Tahoma",
    "Trebuchet MS",
    "Times New Roman",
    "Georgia",
    "Garamond",
    "Courier New",
    "Brush Script MT",
    "Palatino",
    "Bookman",
    "Comic Sans MS",
    "Impact",
    "Lucida Sans Unicode",
    "Geneva",
    "Lucida Console",
]


export const filters = [
    "polaroid",
    "sepia",
    "kodachrome",
    "contrast",
    "brightness",
    "brownie",
    "vintage",
    "technicolor",
    "pixelate",
    "invert",
    "blur",
    "sharpen",
    "emboss",
    "removecolor",
    "blacknwhite",
    "vibrance",
    "blendcolor",
    "huerotate",
    "resize",
    "gamma",
    "none",
]

export const selectionDependentTools = [
    "fill",
    "font",
    "filter",
    "opacity",
    "stroke-color",
    "stroke-width",
    "remove-bg"
]

export const colors = [
    material.red["500"],
    material.pink["500"],
    material.purple["500"],
    material.deepPurple["500"],
    material.indigo["500"],
    material.blue["500"],
    material.lightBlue["500"],
    material.cyan["500"],
    material.teal["500"],
    material.green["500"],
    material.lightGreen["500"],
    material.lime["500"],
    material.yellow["500"],
    material.amber["500"],
    material.orange["500"],
    material.deepOrange["500"],
    material.brown["500"],
    material.blueGrey["500"],
    "transparent",
]

export type ActiveTool = 
    | "select" 
    | "shape" 
    | "text" 
    | "image" 
    | "emote" 
    | "generate" 
    | "filter" 
    | "draw" 
    | "inpaint"
    | "fill"
    | "stroke-color"
    | "stroke-width"
    | "font"
    | "opacity"
    | "remove-bg"
    | "emotes"
    | "emote-generator"
    | "images"
    | "shapes"
    | "settings"
    | "enhance"
    | "video-generator"

export const FILL_COLOR = "rgba(0,0,0,1)";
export const STROKE_COLOR = "rgba(0,0,0,1)";
export const STROKE_WIDTH = 2;
export const STROKE_DASH_ARRAY = []
export const FONT_FAMILY = "Arial"
export const FONT_SIZE = 32

export const CIRCLE_OPTIONS = {
    radius: 50,
    left: 100,
    top: 100,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
}

export const RECTANGLE_OPTIONS = {
    width: 100,
    height: 100,
    left: 100,
    top: 100,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
}

export const TRIANGLE_OPTIONS = {
    width: 100,
    height: 100,
    left: 100,
    top: 100,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
}

export const TEXT_OPTIONS = {
    type: "textbox",
    left: 100,
    top: 100,
    fill: FILL_COLOR,
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY,
}

export interface EditorHookProps {
    clearSelectionCallback?: () => void;
}

export type BuildEditorProps = {
    canvas: fabric.Canvas;
    fillColor: string;
    setFillColor: (color: string) => void;
    strokeColor: string;
    setStrokeColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    selectedObjects: fabric.Object[];
    strokeDashArray: number[];
    setStrokeDashArray: (value: number[]) => void;
    fontFamily: string;
    setFontFamily: (value: string) => void;
    // shakeAnimation: (object: fabric.Object) => void;
    enhanceImage: () => Promise<void>;

}

export interface Editor {
    getActiveImageUrl: () => string;
    updateImage: (url: string) => void;
    generateMaskUrl: () => string;
    inpaint: (prompt: string, maskUrl: string) => void;
    changeImageFilter: (value: string) => void;
    addGeneratedEmote: (value: string) => void;
    addEmote: (value: string) => void;
    addImage: (value: string) => void;
    delete: () => void;
    addText: (value: string, options?: ITextOptions) => void;
    getActiveOpacity: () => number;
    changeOpacity: (value: number) => void;
    bringForward: () => void;
    sendBackwards: () => void;
    addCircle: () => void;
    addSoftRectangle: () => void;
    addRectangle: () => void;
    addTriangle: () => void;
    addInverseTriangle: () => void;
    addDiamond: () => void;
    changeFillColor: (value: string) => void;
    changeStrokeWidth: (value: number) => void;
    changeStrokeDashArray: (value: number[]) => void;
    changeStrokeColor: (value: string) => void;
    getActiveStrokeWidth: () => number;
    getActiveFillColor: () => string;
    getActiveStrokeColor: () => string;
    getActiveStrokeDashArray: () => number[];
    canvas: fabric.Canvas;
    selectedObjects: fabric.Object[];
    changeFontFamily: (value: string) => void;
    getActiveFontFamily: () => string;
    removeBackground: () => void;
    enableDrawingMode: () => void;
    disableDrawingMode: () => void;
    downloadImage: () => void;
    // shakeAnimation: (object: fabric.Object) => void;
    saveEmote: (prompt: string, userId: string) => Promise<Emote | undefined>;
    startDrawingMask: () => void; // Add this method
    clearMask: () => void; // Add this method
    enhanceImage: () => Promise<void>;
    generateVideo: () => Promise<void>;
    addVideo: (url: string) => Promise<VideoObject>;
    updateVideoTrim: (startTime: number, endTime: number) => void;
    getVideoTrimTimes: () => { startTime: number; endTime: number } | null;
    playActiveVideo: () => void;
    pauseActiveVideo: () => void;
    isVideoObject: (object: fabric.Object) => boolean;

    
}

export const generation = {
    models: [
        {
            name: "DALL-E 3",
            apiRoute: "/api/models/dalle",
            description: "Generate emotes using DALL-E 3 model.",
            themes: [
                {
                    name: "chibi",
                    prompt: "Create a chibi style emote of {subject}.",
                },
                {
                    name: "pixel",
                    prompt: "Create a pixel art style emote of {subject}.",
                },
                {
                    name: "cartoon",
                    prompt: "Create a cartoon style emote of {subject}.",
                },
            ],
        },
        // {
        //     name: "stableDiffusion",
        //     apiRoute: "/api/models/stable-diffusion",
        //     description: "Generate emotes using Stable Diffusion model.",
        //     themes: [
        //         {
        //             name: "chibi",
        //             prompt: "Create a chibi style emote of {subject}.",
        //         },
        //         {
        //             name: "pixel",
        //             prompt: "Create a pixel art style emote of {subject}.",
        //         },
        //         {
        //             name: "realistic",
        //             prompt: "Create a realistic style emote of {subject}.",
        //         },
        //     ],
        // },
        {
            name: "FLUX.1 [dev]",
            apiRoute: "/api/models/fal/fluxdev",
            description: "Generate emotes using the Flux-Dev model.",
            themes: [
                {
                    name: "chibi",
                    prompt: "Create a chibi style emote of ${subject}.",
                },
                {
                    name: "pixel",
                    prompt: "Create a pixel art style emote of ${subject}.",
                },
                {
                    name: "realistic",
                    prompt: "Create a realistic style emote of ${subject}.",
                },
            ],
        },
        {
            name: "FLUX.1 [schnell]",
            apiRoute: "/api/models/fal/fluxschnell",
            description: "Generate emotes using the Flux-Schnell model.",
            themes: [
                {
                    name: "chibi",
                    prompt: "Create a chibi style emote of ${subject}.",
                },
                {
                    name: "pixel",
                    prompt: "Create a pixel art style emote of ${subject}.",
                },
                {
                    name: "realistic",
                    prompt: "Create a realistic style emote of ${subject}.",
                },
            ],
        },
        {
            name: "FLUX 1 [pro]",
            apiRoute: "/api/models/fal/fluxpro",
            description: "Generate emotes using the Flux-Pro model.",
            themes: [
                {
                    name: "chibi",
                    prompt: "Create a chibi style emote of ${subject}.",
                },
                {
                    name: "pixel",
                    prompt: "Create a pixel art style emote of ${subject}.",
                },
                {
                    name: "realistic",
                    prompt: "Create a realistic style emote of ${subject}.",
                },
            ],
        },
        {
            name: "FLUX 1.1 [pro]",
            apiRoute: "/api/models/fal/fluxpro11",
            description: "Generate emotes using the Flux-Pro 1.1 model.",
            themes: [
                {
                    name: "chibi",
                    prompt: "Create a chibi style emote of ${subject}.",
                },
                {
                    name: "pixel",
                    prompt: "Create a pixel art style emote of ${subject}.",
                },
                {
                    name: "realistic",
                    prompt: "Create a realistic style emote of ${subject}.",
                },
            ],
        },
        {
            name: "FLUX.1 [dev] - Image to Image",
            apiRoute: "/api/models/fal/fluxdev/imagetoimage",
            description: "Generate emotes using the Flux-Schnell model.",
            themes: [
                {
                    name: "chibi",
                    prompt: "Create a chibi style emote of ${subject}.",
                },
                {
                    name: "pixel",
                    prompt: "Create a pixel art style emote of ${subject}.",
                },
                {
                    name: "realistic",
                    prompt: "Create a realistic style emote of ${subject}.",
                },
            ],
        },
        {
            name: "Aura Flow",
            apiRoute: "/api/models/fal/auraflow",
            description: "Generate high-quality images using the Aura Flow model.",
            themes: [
                {
                    name: "portrait",
                    prompt: "Create a detailed portrait of ${subject}.",
                },
                {
                    name: "landscape",
                    prompt: "Generate a beautiful landscape featuring ${subject}.",
                },
                {
                    name: "abstract",
                    prompt: "Create an abstract representation of ${subject}.",
                },
            ],
        },
    ],
};

// Update the enhancement models definition to use the correct types
export const enhancement = {
    models: [
        {
            name: "Aura SR",
            apiRoute: "/api/models/fal/aurasr",
            description: "Enhance images using the Aura SR model.",
            options: [
                {
                    name: "upscaling_factor",
                    type: "select" as const,
                    values: ["4"],
                    default: "4"
                },
                {
                    name: "overlapping_tiles",
                    type: "boolean" as const,
                    default: true
                },
                {
                    name: "checkpoint",
                    type: "select" as const,
                    values: ["v1", "v2"],
                    default: "v2"
                }
            ] as const
        },
        {
            name: "Creative Upscaler",
            apiRoute: "/api/models/fal/creativeupscaler",
            description: "Enhance and upscale images with creative options.",
            options: [
                {
                    name: "model_type",
                    type: "select" as const,
                    values: ["SD_1_5", "SDXL"],
                    default: "SD_1_5"
                },
                {
                    name: "scale",
                    type: "number" as const,
                    min: 1,
                    max: 4,
                    step: 0.1,
                    default: 2
                },
                {
                    name: "creativity",
                    type: "number" as const,
                    min: 0,
                    max: 1,
                    step: 0.1,
                    default: 0.5
                },
                {
                    name: "detail",
                    type: "number" as const,
                    min: 0,
                    max: 2,
                    step: 0.1,
                    default: 1
                },
                {
                    name: "shape_preservation",
                    type: "number" as const,
                    min: 0,
                    max: 1,
                    step: 0.05,
                    default: 0.25
                }
            ] as const
        },
        {
            name: "Clarity Upscaler",
            apiRoute: "/api/models/fal/clarityupscaler",
            description: "Enhance images with the Clarity Upscaler model.",
            options: [
                {
                    name: "upscale_factor",
                    type: "number" as const,
                    min: 1,
                    max: 4,
                    step: 0.1,
                    default: 2
                },
                {
                    name: "creativity",
                    type: "number" as const,
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 0.35
                },
                {
                    name: "resemblance",
                    type: "number" as const,
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 0.6
                },
                {
                    name: "guidance_scale",
                    type: "number" as const,
                    min: 1,
                    max: 20,
                    step: 0.1,
                    default: 4
                },
                {
                    name: "num_inference_steps",
                    type: "number" as const,
                    min: 1,
                    max: 50,
                    step: 1,
                    default: 18
                },
                {
                    name: "prompt",
                    type: "string" as const,
                    default: "masterpiece, best quality, highres"
                },
                {
                    name: "negative_prompt",
                    type: "string" as const,
                    default: "(worst quality, low quality, normal quality:2)"
                }
            ] as const
        },
        {
            name: "CCSR",
            apiRoute: "/api/models/fal/ccsr",
            description: "Enhance images using the Consistent Color Super-Resolution model.",
            options: [
                {
                    name: "scale",
                    type: "number" as const,
                    min: 1,
                    max: 4,
                    step: 0.1,
                    default: 2
                },
                {
                    name: "tile_diffusion",
                    type: "select" as const,
                    values: ["none", "mix", "gaussian"],
                    default: "none"
                },
                {
                    name: "tile_diffusion_size",
                    type: "number" as const,
                    min: 256,
                    max: 2048,
                    step: 128,
                    default: 1024
                },
                {
                    name: "tile_diffusion_stride",
                    type: "number" as const,
                    min: 128,
                    max: 1024,
                    step: 64,
                    default: 512
                },
                {
                    name: "tile_vae",
                    type: "boolean" as const,
                    default: false
                },
                {
                    name: "steps",
                    type: "number" as const,
                    min: 1,
                    max: 100,
                    step: 1,
                    default: 50
                },
                {
                    name: "color_fix_type",
                    type: "select" as const,
                    values: ["none", "wavelet", "adain"],
                    default: "adain"
                },
                {
                    name: "seed",
                    type: "number" as const,
                    min: 0,
                    max: 2147483647,
                    step: 1,
                    default: -1
                }
            ] as const
        }
    ] as const,
};

// Define the EnhancementModel type
type EnhancementModel = typeof enhancement.models[number];

// Define the ModelOption type
type ModelOption = EnhancementModel['options'][number];

// Export these types
export type { EnhancementModel, ModelOption };

// At the top with other type declarations
export type VideoModelOption = 
  | {
      name: string;
      type: "select";
      values: readonly string[];
      default: string;
    }
  | {
      name: string;
      type: "number";
      min: number;
      max: number;
      step: number;
      default: number;
    }
  | {
      name: string;
      type: "string";
      default: string;
    }
  | {
      name: string;
      type: "boolean";
      default: boolean;
    };

export type VideoGenerationModel = {
  name: string;
  apiRoute: string;
  description: string;
  options: readonly VideoModelOption[];
};

// Configuration object
export const videoGeneration = {
  models: [
    {
      name: "Minimax",
      apiRoute: "/api/models/fal/minimax-video/image-to-video",
      description: "Generate videos from images using Minimax model.",
      options: [
        {
          name: "duration",
          type: "select",
          values: ["5", "10"],
          default: "5"
        },
        {
          name: "ratio",
          type: "select",
          values: ["16:9", "9:16"],
          default: "16:9"
        },
        {
          name: "prompt_optimizer",
          type: "boolean",
          default: true
        }
      ] as const
    },
    {
      name: "Runway Gen3 Turbo",
      apiRoute: "/api/models/fal/runway-gen3-turbo-image-to-video",
      description: "Generate videos from images using Runway Gen3 Turbo model.",
      options: [
        {
          name: "duration",
          type: "select",
          values: ["5", "10"],
          default: "5"
        },
        {
          name: "ratio",
          type: "select",
          values: ["16:9", "9:16"],
          default: "16:9"
        }
      ] as const
    }
  ] as const,
} as const;