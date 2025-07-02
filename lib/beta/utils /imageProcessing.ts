import GIF from 'gif.js/dist/gif'

export async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
  
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
  
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, file.type);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }
  
  export async function createAnimatedGif(
    canvas: HTMLCanvasElement,
    animation: {
      type: 'none' | 'shake' | 'spin' | 'bounce' | 'zoom' | 'slide' | 'flip' | 'pet'
      speed: number
      handX?: number
      handY?: number
      patDistance?: number
    },
    handPatImage?: string
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: 128,
        height: 128,
        workerScript: '/gif.worker.js'
      });

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 128;
      tempCanvas.height = 128;
      const ctx = tempCanvas.getContext('2d')!;

      const frameCount = 30;
      const duration = 2000 / animation.speed; // 2 seconds per cycle adjusted by speed
      const frameDelay = duration / frameCount;

      // If it's a pet animation, load the hand image first
      if (animation.type === 'pet' && handPatImage) {
        const handImg = new Image();
        handImg.onload = () => {
          generateFrames(handImg);
        };
        handImg.onerror = () => {
          reject(new Error('Failed to load hand image'));
        };
        handImg.src = handPatImage;
      } else {
        generateFrames();
      }

      function generateFrames(handImg?: HTMLImageElement) {
        // Generate frames based on animation type
        for (let i = 0; i < frameCount; i++) {
          const progress = i / frameCount;
          ctx.clearRect(0, 0, 128, 128);
          
          // Set up the transform for the base image
          ctx.save();
          ctx.translate(64, 64);
          
          // Apply animation transform
          switch (animation.type) {
            case 'shake':
              const shakeX = Math.sin(progress * Math.PI * 4) * 5;
              ctx.translate(shakeX, 0);
              break;
            case 'spin':
              ctx.rotate(progress * Math.PI * 2);
              break;
            case 'bounce':
              const bounceY = Math.sin(progress * Math.PI * 2) * -10;
              ctx.translate(0, bounceY);
              break;
            case 'zoom':
              const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.2;
              ctx.scale(scale, scale);
              break;
            case 'slide':
              const slideX = Math.sin(progress * Math.PI * 2) * 20;
              ctx.translate(slideX, 0);
              break;
            case 'flip':
              const flipScale = Math.cos(progress * Math.PI * 2);
              ctx.scale(flipScale, 1);
              break;
          }
          
          // Draw the base image
          ctx.translate(-64, -64);
          ctx.drawImage(canvas, 0, 0);
          ctx.restore();

          // Draw the hand for pet animation
          if (animation.type === 'pet' && handImg) {
            const { handX = 50, handY = 0, patDistance = 60 } = animation;
            const handProgress = progress * Math.PI * 2;
            const handYPos = -60 - Math.sin(handProgress) * patDistance;
            const handXPos = (handX - 50);
            
            ctx.save();
            ctx.translate(64 + handXPos, 64 + handYPos + handY);
            ctx.translate(-24, -24); // Center the hand
            ctx.drawImage(handImg, 0, 0, 48, 48);
            ctx.restore();
          }

          // Add frame to GIF
          gif.addFrame(tempCanvas, { delay: frameDelay, copy: true });
        }

        gif.render();
      }

      gif.on('finished', (blob: Blob) => {
        resolve(blob);
      });

      gif.on('error', (error: Error) => {
        reject(error);
      });
    });
  }
  
  