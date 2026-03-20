import { create } from 'zustand';
import type { Artwork, Room } from '@/lib/storage/db';
import { listAllArtworks, listArtworksByRoom } from '@/lib/storage/artworks';
import { listRooms } from '@/lib/storage/rooms';

interface GalleryState {
    artworks: Artwork[];
    rooms: Room[];
    activeRoomId: string;
    viewMode: 'walk' | 'grid';

    // Actions
    setActiveRoom: (roomId: string) => void;
    toggleViewMode: () => void;
    refresh: () => Promise<void>;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
    artworks: [],
    rooms: [],
    activeRoomId: 'my-art',
    viewMode: 'walk',

    setActiveRoom: (roomId) => {
        set({ activeRoomId: roomId });
        get().refresh();
    },

    toggleViewMode: () => {
        set((s) => ({ viewMode: s.viewMode === 'walk' ? 'grid' : 'walk' }));
    },

    refresh: async () => {
        const rooms = await listRooms();
        const { activeRoomId } = get();

        const artworks =
            activeRoomId === 'all'
                ? await listAllArtworks()
                : await listArtworksByRoom(activeRoomId);

        set({ artworks, rooms });
    },
}));