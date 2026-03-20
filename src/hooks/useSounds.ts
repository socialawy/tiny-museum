'use client';

import { useCallback } from 'react';
import { sounds, type SoundName } from '@/lib/audio/sounds';
import { useUIStore } from '@/stores/ui.store';

export function useSounds() {
  const soundEnabled = useUIStore((s) => s.soundEnabled);

  const playSound = useCallback(
    (name: SoundName) => {
      if (!soundEnabled) return;
      if (typeof window === 'undefined') return;

      const fn = sounds[name];
      if (fn) fn();

      // Also try haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(8);
      }
    },
    [soundEnabled],
  );

  return { playSound };
}
