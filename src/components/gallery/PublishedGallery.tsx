'use client';

import type { PublishedArtwork } from '@/lib/cloud/types';

interface Props {
  artworks: PublishedArtwork[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function PublishedGallery({ artworks }: Props) {
  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <span className="text-6xl">🏛️</span>
        <h2 className="text-2xl font-extrabold text-kid-purple">The gallery is empty!</h2>
        <p className="text-kid-purple/60 text-sm">
          Publish artwork from the studio to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {artworks.map((artwork, i) => (
        <div
          key={artwork.id}
          className="gallery-card-enter flex flex-col"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Gold frame */}
          <div
            className="relative"
            style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #8B6914 50%, #C9A84C 100%)',
              padding: 8,
              aspectRatio: '4 / 5',
            }}
          >
            {/* White paper inside frame */}
            <div className="bg-[#FFFEF7] w-full h-full flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork.image_url}
                alt={artwork.title}
                loading="lazy"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Flipbook badge */}
            {artwork.type === 'flipbook' && (
              <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                🎬
              </span>
            )}
          </div>

          {/* Plaque */}
          <div
            className="px-2 py-1.5 text-center"
            style={{ background: '#2D1B69', color: '#F5E6D3' }}
          >
            <p className="text-sm font-bold truncate">{artwork.title}</p>
            <p className="text-xs opacity-70">{formatDate(artwork.published_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
