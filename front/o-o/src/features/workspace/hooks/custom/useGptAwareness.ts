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
 * Listens to all participants' Awareness state and returns the GPT session
 * if any participant has GPT state (recording or processing).
 *
 * Note:
 * - Returns GPT state even when isRecording is false to preserve startedBy
 * - Shares GPT state globally (no local priority) for keyword panel sync
 */
export function useGptAwareness(awareness?: Awareness): GptState | null {
  const [gptState, setGptState] = useState<GptState | null>(null);

  useEffect(() => {
    if (!awareness) {
      setGptState(null);
      return;
    }

    const updateGptState = () => {
      // Find any peer with GPT state (recording or processing)
      // Check all participants (no priority, share GPT state globally)
      const states = Array.from(awareness.getStates().entries());

      console.log('[useGptAwareness] 🔍 Checking awareness states:', {
        totalStates: states.length,
        myClientId: awareness.clientID,
        allClientIds: states.map(([id]) => id),
      });

      // Log ALL states for debugging
      states.forEach(([clientId, state]) => {
        const gptData = (state as any)?.gpt;
        console.log(`[useGptAwareness] 📊 Client ${clientId}:`, {
          hasGptData: !!gptData,
          isRecording: gptData?.isRecording,
          keywordsCount: gptData?.keywords?.length,
          keywords: gptData?.keywords?.map((k: any) => k.label),
          startedBy: gptData?.startedBy,
          timestamp: gptData?.timestamp,
        });
      });

      // Check all participants for GPT state with keywords
      for (const [clientId, state] of states) {
        const gptData = (state as any)?.gpt;

        if (gptData && gptData.keywords && gptData.keywords.length > 0) {
          console.log('[useGptAwareness] ✅ GPT state with keywords found, updating local state:', {
            clientId,
            keywordsCount: gptData.keywords.length,
            keywords: gptData.keywords.map((k: any) => k.label),
          });
          setGptState(gptData);
          return;
        }
      }

      // Check for GPT state without keywords (isRecording only)
      for (const [clientId, state] of states) {
        const gptData = (state as any)?.gpt;

        if (gptData) {
          console.log('[useGptAwareness] ⚠️ GPT state found but no keywords:', {
            clientId,
            isRecording: gptData.isRecording,
            keywordsCount: gptData.keywords?.length || 0,
          });
          setGptState(gptData);
          return;
        }
      }

      // No GPT state found
      console.log('[useGptAwareness] ❌ No GPT state found');
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
