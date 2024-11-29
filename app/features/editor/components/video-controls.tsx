import React, { useEffect, useState } from 'react';
import { Editor, VideoObject } from '../types';
import { VideoTimeline } from './video-timeline';

interface VideoControlsProps {
    editor: Editor | undefined;
}

export const VideoControls: React.FC<VideoControlsProps> = ({ editor }) => {
    const [activeVideo, setActiveVideo] = useState<VideoObject | null>(null);

    useEffect(() => {
        if (!editor) return;

        const checkActiveObject = () => {
            const active = editor.canvas.getActiveObject() as VideoObject;
            if (active && editor.isVideoObject(active)) {
                setActiveVideo(active);
            } else {
                setActiveVideo(null);
            }
        };

        editor.canvas.on('selection:created', checkActiveObject);
        editor.canvas.on('selection:updated', checkActiveObject);
        editor.canvas.on('selection:cleared', () => setActiveVideo(null));

        return () => {
            editor.canvas.off('selection:created', checkActiveObject);
            editor.canvas.off('selection:updated', checkActiveObject);
            editor.canvas.off('selection:cleared');
        };
    }, [editor]);

    if (!editor || !activeVideo) return null;

    return (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[400px]">
            <VideoTimeline
                videoElement={activeVideo.getElement() as HTMLVideoElement}
                onTimeUpdate={(startTime, endTime) => {
                    editor.updateVideoTrim(startTime, endTime);
                }}
                compact={true}
            />
        </div>
    );
}; 