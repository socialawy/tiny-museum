'use client';

import { useCallback } from 'react';

// Phase 1 stub — will wire up real sounds in Week 6
export function useSounds() {
    const playSound = useCallback((name: string) => {
        // TODO: load from /assets/sounds/
        // For now, optional vibration feedback on mobile
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
    }, []);

    return { playSound };
}