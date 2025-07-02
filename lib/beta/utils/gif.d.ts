declare module 'gif.js/dist/gif' {
  interface GIFOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    workerScript?: string
    [key: string]: any
  }

  interface GIFFrameOptions {
    delay?: number
    copy?: boolean
    [key: string]: any
  }

  class GIF {
    constructor(options: GIFOptions)
    addFrame(imageElement: CanvasImageSource, options?: GIFFrameOptions): void
    on(event: 'finished', callback: (blob: Blob) => void): void
    on(event: 'error', callback: (error: Error) => void): void
    render(): void
  }

  export default GIF
} 