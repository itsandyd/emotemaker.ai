declare module 'html-to-image' {
  export interface Options {
    width?: number;
    height?: number;
    pixelRatio?: number;
    skipAutoScale?: boolean;
    style?: Record<string, string>;
  }
  export function toPng(node: HTMLElement, options?: Options): Promise<string>;
} 