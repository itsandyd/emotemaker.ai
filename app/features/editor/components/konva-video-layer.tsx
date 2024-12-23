import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import Konva from 'konva';
import { VideoObject } from '../types';

interface KonvaVideoLayerProps {
    video: VideoObject;
    width: number;
    height: number;
    onUpdate?: () => void;
}

export const KonvaVideoLayer: React.FC<KonvaVideoLayerProps> = ({
    video,
    width,
    height,
    onUpdate
}) => {
    const videoRef = useRef<Konva.Image>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        const videoElement = video.getVideoElement();
        const konvaVideo = videoRef.current;
        
        if (!konvaVideo || !videoElement) return;

        // Set initial image
        konvaVideo.image(videoElement);
        
        // Animation function
        const animate = () => {
            // Update Konva image
            konvaVideo.image(videoElement);
            
            // Check trim bounds
            if (videoElement.currentTime < video.attrs.startTime || 
                videoElement.currentTime > video.attrs.endTime) {
                videoElement.currentTime = video.attrs.startTime;
            }
            
            // Force layer update
            konvaVideo.getLayer()?.batchDraw();
            
            // Call update callback
            onUpdate?.();
            
            // Continue animation
            animationRef.current = requestAnimationFrame(animate);
        };

        // Start animation
        animationRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [video, onUpdate]);

    return (
        <Stage width={width} height={height}>
            <Layer>
                <Image
                    ref={videoRef}
                    width={width}
                    height={height}
                    listening={false}
                    image={video.getVideoElement()}
                />
            </Layer>
        </Stage>
    );
}; 