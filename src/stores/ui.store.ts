import { create } from 'zustand';

interface UIState {
  soundEnabled: boolean;
  toggleSound: () => void;
  celebrating: boolean;
  celebrate: () => void;
}

let celebrationTimer: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIState>((set) => ({
  soundEnabled: true,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  celebrating: false,
  celebrate: () => {
    // Clear any existing timer to prevent stacking
    if (celebrationTimer) clearTimeout(celebrationTimer);
    set({ celebrating: true });
    celebrationTimer = setTimeout(() => {
      set({ celebrating: false });
      celebrationTimer = null;
    }, 2000);
  },
}));
