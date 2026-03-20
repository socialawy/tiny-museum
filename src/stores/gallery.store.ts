import { create } from 'zustand';
import type { Artwork, Room } from '@/lib/storage/db';
import { listAllArtworks, listArtworksByRoom } from '@/lib/storage/artworks';
import { listRooms } from '@/lib/storage/rooms';

interface GalleryState {
  artworks: Artwork[];
  rooms: Room[];
  activeRoomId: string;
  viewMode: 'walk' | 'grid';
  isLoading: boolean;

  setActiveRoom: (roomId: string) => void;
  toggleViewMode: () => void;
  refresh: () => Promise<void>;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  artworks: [],
  rooms: [],
  activeRoomId: 'my-art',
  viewMode: 'walk',
  isLoading: true,

  setActiveRoom: (roomId) => {
    set({ activeRoomId: roomId, isLoading: true });
    get().refresh();
  },

  toggleViewMode: () => {
    set((s) => ({ viewMode: s.viewMode === 'walk' ? 'grid' : 'walk' }));
  },

  refresh: async () => {
    try {
      const rooms = await listRooms();
      const { activeRoomId } = get();

      const artworks =
        activeRoomId === 'all'
          ? await listAllArtworks()
          : await listArtworksByRoom(activeRoomId);

      set({ artworks, rooms, isLoading: false });
    } catch (err) {
      console.error('Gallery refresh failed:', err);
      set({ isLoading: false });
    }
  },
}));
