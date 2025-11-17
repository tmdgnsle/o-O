import { useState, useEffect } from 'react';
import type { Awareness } from 'y-protocols/awareness';

export interface GptState {
  isRecording: boolean;
  keywords: Array<{ id: string; label: string; children?: any[] }>;
  startedBy: string;
  timestamp: number;
}

/**
 * Hook to subscribe to GPT recording state from Yjs Awareness
 *
 * Listens to all participants' Awareness state and returns the active GPT session
 * if any participant is recording.
 */
export function useGptAwareness(awareness?: Awareness): GptState | null {
  const [gptState, setGptState] = useState<GptState | null>(null);

  useEffect(() => {
    if (!awareness) {
      setGptState(null);
      return;
    }

    const updateGptState = () => {
      // Find any peer with active GPT recording
      // Priority: Local user first, then other participants
      const states = Array.from(awareness.getStates().entries());

      // Check local state first
      const localClientId = awareness.clientID;
      const localState = awareness.getLocalState() as any;
      if (localState?.gpt?.isRecording) {
        setGptState(localState.gpt);
        return;
      }

      // Check other participants
      for (const [clientId, state] of states) {
        if (clientId === localClientId) continue; // Skip local (already checked)

        const gptData = (state as any)?.gpt;
        if (gptData?.isRecording) {
          setGptState(gptData);
          return;
        }
      }

      // No active recording found
      setGptState(null);
    };

    // Subscribe to awareness changes
    awareness.on('change', updateGptState);

    // Initial state
    updateGptState();

    return () => {
      awareness.off('change', updateGptState);
    };
  }, [awareness]);

  return gptState;
}
