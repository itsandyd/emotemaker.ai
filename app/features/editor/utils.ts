import { RGBColor } from "react-color"
import { uuid } from "uuidv4"
import Konva from 'konva'

export function downloadFile(file: string, type: string) {
    const anchorElement = document.createElement("a");

    anchorElement.href = file;
    anchorElement.download = `${uuid()}.${type}`;
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.remove();
}

export function isTextType (type: string | undefined) {
    return type === "text" || type === "textbox"
}

export function rgbaObjectToString(rgba: RGBColor | "transparent") {
    if (rgba === "transparent") {
        return "rgba(0, 0, 0, 0)"
    }

    const alpha = rgba.a === undefined ? 1 : rgba.a;

    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`
}

export const createFilter = (value: string) => {
    let effect;

    switch (value) {
        case "blur":
            effect = Konva.Filters.Blur;
            break;
        case "brightness":
            effect = Konva.Filters.Brighten;
            break;
        case "contrast":
            effect = Konva.Filters.Contrast;
            break;
        case "pixelate":
            effect = Konva.Filters.Pixelate;
            break;
        case "noise":
            effect = Konva.Filters.Noise;
            break;
        case "invert":
            effect = Konva.Filters.Invert;
            break;
        case "sepia":
            effect = Konva.Filters.Sepia;
            break;
        case "grayscale":
            effect = Konva.Filters.Grayscale;
            break;
        case "threshold":
            effect = Konva.Filters.Threshold;
            break;
        case "rgb":
            effect = Konva.Filters.RGB;
            break;
        case "hsv":
            effect = Konva.Filters.HSV;
            break;
        case "hsv":
            effect = Konva.Filters.HSL;
            break;
        case "emboss":
            effect = Konva.Filters.Emboss;
            break;
        case "enhance":
            effect = Konva.Filters.Enhance;
            break;
        case "posterize":
            effect = Konva.Filters.Posterize;
            break;
        case "kaleidoscope":
            effect = Konva.Filters.Kaleidoscope;
            break;
        default: 
            effect = null;
            break;
    }

    return effect;
}

export const generateThemedEmotePrompt = (prompt: string, theme: string) => {
    let styleDescription = '';
    let additionalDetails = '';
  
    switch (theme.toLowerCase()) {
        case 'pixel':
            styleDescription = 'in a pixel art style';
            additionalDetails = 'The design should use a limited color palette and visible pixels, reminiscent of early video game graphics.';
            break;
        case 'kawaii':
            styleDescription = 'in a kawaii style';
            additionalDetails = 'The design should be ultra-cute with soft colors, simple shapes, and possibly blush marks on the cheeks.';
            break;
        case 'object':
            styleDescription = 'as an object';
            additionalDetails = 'The emote should represent a physical object with clear, simple lines and vibrant colors.';
            break;
        case 'cute-bold-line':
            styleDescription = 'with cute bold lines';
            additionalDetails = 'The design should feature bold, rounded lines that enhance the cuteness of the emote.';
            break;
        case 'text-based':
            styleDescription = 'as text-based';
            additionalDetails = 'The emote should primarily use stylized text or calligraphy to convey an expression or sentiment.';
            break;
        case '3d-based':
            styleDescription = 'in a 3D style';
            additionalDetails = 'The emote should have a three-dimensional appearance, with detailed shading and lighting to enhance depth.';
            break;
        case 'pepe-based':
            styleDescription = 'in a Pepe style';
            additionalDetails = 'The emote should mimic the distinctive, somewhat crude art style of Pepe the Frog memes.';
            break;
        case 'sticker-based':
            styleDescription = 'as a sticker';
            additionalDetails = 'The emote should look like a sticker, possibly with a white border and shadow to give it a lifted effect.';
            break;
        case 'chibi':
            styleDescription = 'in a chibi style';
            additionalDetails = 'The character should have large, expressive eyes and a cute, simplified design with an oversized head and small body.';
            break;
        case 'meme':
            styleDescription = 'as a meme';
            additionalDetails = 'The emote should incorporate elements of popular memes, using humor and recognizable themes.';
            break;
        case 'ghibli':
            styleDescription = 'inspired by Studio Ghibli\'s art style';
            additionalDetails = 'The emote should have a whimsical, hand-drawn quality with soft edges and a slightly muted color palette.';
            break;
        default:
            styleDescription = 'with a unique style';
            additionalDetails = 'The design should be visually appealing and recognizable at a small scale.';
    }

    return `Design a single, expressive digital emote ${styleDescription}, suitable for use on a Twitch streamer's channel. The emote should depict ${prompt}, ensuring visibility and impact at a small scale. It should feature exaggerated characteristics appropriate for ${prompt}, conveying a specific emotion or reaction. ${additionalDetails} with a solid white background.`;
}