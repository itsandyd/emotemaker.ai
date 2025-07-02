import { useCallback, useRef, useMemo } from 'react';

// Custom debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

// Custom throttle implementation
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  const throttled = ((...args: any[]) => {
    const now = Date.now();
    if (!previous) previous = now;
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    previous = 0;
  };

  return throttled;
}

interface UseEditorPerformanceOptions {
  debounceMs?: number;
  throttleMs?: number;
  enableVirtualization?: boolean;
}

export function useEditorPerformance(options: UseEditorPerformanceOptions = {}) {
  const {
    debounceMs = 300,
    throttleMs = 16, // ~60fps
    enableVirtualization = true
  } = options;

  // Create stable references for optimization functions
  const debouncedOperations = useRef(new Map<string, any>());
  const throttledOperations = useRef(new Map<string, any>());

  // Debounced save operation
  const createDebouncedOperation = useCallback((
    key: string,
    operation: (...args: any[]) => void,
    delay: number = debounceMs
  ) => {
    if (!debouncedOperations.current.has(key)) {
      debouncedOperations.current.set(key, debounce(operation, delay));
    }
    return debouncedOperations.current.get(key);
  }, [debounceMs]);

  // Throttled render operations
  const createThrottledOperation = useCallback((
    key: string,
    operation: (...args: any[]) => void,
    delay: number = throttleMs
  ) => {
    if (!throttledOperations.current.has(key)) {
      throttledOperations.current.set(key, throttle(operation, delay));
    }
    return throttledOperations.current.get(key);
  }, [throttleMs]);

  // Memoized canvas calculations
  const memoizedCalculations = useMemo(() => ({
    calculateBounds: (width: number, height: number) => ({
      x: 0,
      y: 0,
      width,
      height,
      centerX: width / 2,
      centerY: height / 2
    }),
    
    calculateScale: (containerWidth: number, containerHeight: number, canvasWidth: number, canvasHeight: number) => {
      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;
      return Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    },
    
    calculatePosition: (x: number, y: number, scale: number) => ({
      x: x * scale,
      y: y * scale
    })
  }), []);

  // Performance monitoring
  const performanceMonitor = useMemo(() => ({
    measureOperation: <T extends (...args: any[]) => any>(
      name: string,
      operation: T
    ): T => {
      return ((...args: any[]) => {
        const startTime = performance.now();
        const result = operation(...args);
        const endTime = performance.now();
        
        // Only log if operation takes more than 16ms (60fps threshold)
        if (endTime - startTime > 16) {
          console.warn(`Slow operation detected: ${name} took ${endTime - startTime}ms`);
        }
        
        return result;
      }) as T;
    },

    batchOperations: (operations: (() => void)[]) => {
      requestAnimationFrame(() => {
        const startTime = performance.now();
        operations.forEach(op => op());
        const endTime = performance.now();
        
        if (endTime - startTime > 16) {
          console.warn(`Batch operations took ${endTime - startTime}ms`);
        }
      });
    }
  }), []);

  // Memory management utilities
  const memoryManager = useMemo(() => ({
    cleanupCanvasObjects: (stage: any) => {
      if (!stage) return;
      
      // Remove unused nodes
      stage.find('Group').forEach((group: any) => {
        if (group.children.length === 0) {
          group.destroy();
        }
      });
      
      // Garbage collect
      stage.batchDraw();
    },

    optimizeImageCache: (maxCacheSize: number = 50) => {
      // Implementation would depend on your image caching strategy
      // This is a placeholder for cache optimization logic
      console.log(`Optimizing image cache with max size: ${maxCacheSize}`);
    }
  }), []);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Cancel all pending debounced operations
    debouncedOperations.current.forEach(operation => {
      if (operation.cancel) operation.cancel();
    });
    
    // Cancel all pending throttled operations
    throttledOperations.current.forEach(operation => {
      if (operation.cancel) operation.cancel();
    });
    
    // Clear maps
    debouncedOperations.current.clear();
    throttledOperations.current.clear();
  }, []);

  return {
    createDebouncedOperation,
    createThrottledOperation,
    memoizedCalculations,
    performanceMonitor,
    memoryManager,
    cleanup,
    
    // Pre-configured common operations
    debouncedSave: createDebouncedOperation('save', () => {}, 1000),
    throttledRender: createThrottledOperation('render', () => {}, throttleMs),
    debouncedResize: createDebouncedOperation('resize', () => {}, 250),
  };
}

// Export performance utilities
export const PerformanceUtils = {
  // Check if device has limited resources
  isLowEndDevice: () => {
    const memory = (navigator as any).deviceMemory;
    const connection = (navigator as any).connection;
    
    return (
      memory && memory < 4 || // Less than 4GB RAM
      connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
    );
  },

  // Optimize based on device capabilities
  getOptimalSettings: () => {
    const isLowEnd = PerformanceUtils.isLowEndDevice();
    
    return {
      maxCanvasSize: isLowEnd ? 256 : 512,
      enableAnimations: !isLowEnd,
      maxUndoSteps: isLowEnd ? 10 : 50,
      enableShadows: !isLowEnd,
      renderQuality: isLowEnd ? 'low' : 'high'
    };
  }
}; 