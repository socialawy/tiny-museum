'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGalleryStore } from '@/stores/gallery.store';
import { cleanExpiredBlobUrls } from '@/lib/storage/migrate';
import { MuseumWalk } from '@/components/gallery/MuseumWalk';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { RoomSelector } from '@/components/gallery/RoomSelector';
import Link from 'next/link';

export default function GalleryPage() {
  const router = useRouter();
  const {
    artworks,
    rooms,
    activeRoomId,
    viewMode,
    setActiveRoom,
    toggleViewMode,
    refresh,
  } = useGalleryStore();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await cleanExpiredBlobUrls();
      await refresh();
      setLoaded(true);
    })();
  }, [refresh]);

  function handleArtworkTap(id: string) {
    router.push(`/gallery/${id}`);
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-4xl animate-bounce">🏛️</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-full"
      style={{
        background: 'linear-gradient(180deg, #F5E6D3 0%, #EDE0CF 100%)',
      }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <h1 className="text-2xl font-extrabold text-museum-plaque">🏛️ Gallery</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleViewMode}
            className="kid-button text-lg"
            aria-label={viewMode === 'walk' ? 'Grid view' : 'Walk view'}
          >
            {viewMode === 'walk' ? '⊞' : '🚶'}
          </button>
          <Link
            href="/studio/canvas"
            className="kid-button text-lg active:scale-90 no-underline"
          >
            ✨ New
          </Link>
        </div>
      </div>

      <RoomSelector
        rooms={rooms}
        activeRoomId={activeRoomId}
        onSelect={setActiveRoom}
        onRoomCreated={() => refresh()}
      />

      <div className="flex-1">
        {viewMode === 'walk' ? (
          <MuseumWalk artworks={artworks} onArtworkTap={handleArtworkTap} />
        ) : (
          <GalleryGrid artworks={artworks} onArtworkTap={handleArtworkTap} />
        )}
      </div>
    </div>
  );
}
