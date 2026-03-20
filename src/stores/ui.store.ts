import { create } from 'zustand';

interface UIState {
  soundEnabled: boolean;
  toggleSound: () => void;
  celebrating: boolean;
  celebrate: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  soundEnabled: true,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  celebrating: false,
  celebrate: () => {
    set({ celebrating: true });
    setTimeout(() => set({ celebrating: false }), 2000);
  },
}));
