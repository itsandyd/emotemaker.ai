import { useState, useCallback, useMemo } from 'react';
import { ActiveTool } from '../types';
import { Emote } from '@prisma/client';

interface EditorState {
  activeTool: ActiveTool;
  emotes: Emote[];
  currentPrompt: string;
  isEditorReady: boolean;
}

interface EditorStateActions {
  setActiveTool: (tool: ActiveTool) => void;
  addEmote: (emote: Emote) => void;
  updateEmotes: (emotes: Emote[]) => void;
  setCurrentPrompt: (prompt: string) => void;
  setEditorReady: (ready: boolean) => void;
  resetState: () => void;
}

interface UseEditorStateProps {
  initialEmotes: Emote[];
  initialActiveTool?: ActiveTool;
}

export const useEditorState = ({ 
  initialEmotes, 
  initialActiveTool = "select" 
}: UseEditorStateProps): [EditorState, EditorStateActions] => {
  const [state, setState] = useState<EditorState>({
    activeTool: initialActiveTool,
    emotes: initialEmotes,
    currentPrompt: "",
    isEditorReady: false
  });

  // Memoized actions to prevent unnecessary re-renders
  const actions = useMemo<EditorStateActions>(() => ({
    setActiveTool: (tool: ActiveTool) => {
      setState(prev => ({ ...prev, activeTool: tool }));
    },

    addEmote: (emote: Emote) => {
      setState(prev => ({ 
        ...prev, 
        emotes: [emote, ...prev.emotes] 
      }));
    },

    updateEmotes: (emotes: Emote[]) => {
      setState(prev => ({ ...prev, emotes }));
    },

    setCurrentPrompt: (prompt: string) => {
      setState(prev => ({ ...prev, currentPrompt: prompt }));
    },

    setEditorReady: (ready: boolean) => {
      setState(prev => ({ ...prev, isEditorReady: ready }));
    },

    resetState: () => {
      setState({
        activeTool: initialActiveTool,
        emotes: initialEmotes,
        currentPrompt: "",
        isEditorReady: false
      });
    }
  }), [initialEmotes, initialActiveTool]);

  return [state, actions];
};

// Selector hooks for specific state slices
export const useActiveEmotes = (state: EditorState, filter?: (emote: Emote) => boolean) => {
  return useMemo(() => {
    return filter ? state.emotes.filter(filter) : state.emotes;
  }, [state.emotes, filter]);
};

export const useEmotesByType = (state: EditorState, isVideo: boolean) => {
  return useMemo(() => {
    return state.emotes.filter(emote => !!emote.isVideo === isVideo);
  }, [state.emotes, isVideo]);
}; 