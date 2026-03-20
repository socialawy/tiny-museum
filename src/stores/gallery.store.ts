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
  totalCount: number;
  favoriteCount: number;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  artworks: [],
  rooms: [],
  activeRoomId: 'my-art',
  viewMode: 'walk',
  isLoading: true,
  totalCount: 0,
  favoriteCount: 0,

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

      const allArtworks = await listAllArtworks();
      const totalCount = allArtworks.length;
      const favoriteCount = allArtworks.filter((a) => a.tags.includes('favorite')).length;

      const artworks =
        activeRoomId === 'all' ? allArtworks : await listArtworksByRoom(activeRoomId);

      set({ artworks, rooms, totalCount, favoriteCount, isLoading: false });
    } catch (err) {
      console.error('Gallery refresh failed:', err);
      set({ isLoading: false });
    }
  },
}));
