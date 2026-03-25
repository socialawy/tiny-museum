'use client';

import type { Artwork } from '@/lib/storage/db';
import { ArtworkCard } from './ArtworkCard';

interface GalleryGridProps {
  artworks: Artwork[];
  onArtworkTap: (id: string) => void;
  isFirst?: boolean;
}

export function GalleryGrid({ artworks, onArtworkTap, isFirst }: GalleryGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <p className="text-5xl mb-4">🖼️</p>
        <p className="text-xl font-bold text-museum-plaque">No art here yet!</p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-6 p-6"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      }}
    >
      {artworks.map((artwork, i) => (
        <div
          key={artwork.id}
          className="gallery-card-enter"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <ArtworkCard
            artwork={artwork}
            size="grid"
            onClick={() => onArtworkTap(artwork.id)}
            isFirst={isFirst && i === 0}
          />
        </div>
      ))}
    </div>
  );
}
