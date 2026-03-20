'use client';

import { useUIStore } from '@/stores/ui.store';

export function SoundToggle() {
  const { soundEnabled, toggleSound } = useUIStore();

  return (
    <button
      onClick={toggleSound}
      className="kid-button text-lg"
      aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      title={soundEnabled ? 'Sound On' : 'Sound Off'}
    >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  );
}
