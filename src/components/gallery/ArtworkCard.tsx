'use client';

import { useState, useEffect } from 'react';
import type { Artwork } from '@/lib/storage/db';

interface ArtworkCardProps {
  artwork: Artwork;
  size?: 'walk' | 'grid';
  onClick?: () => void;
}

export function ArtworkCard({ artwork, size = 'walk', onClick }: ArtworkCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string>('');

  useEffect(() => {
    if (artwork.thumbnail) {
      const url = URL.createObjectURL(artwork.thumbnail);
      setThumbUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [artwork.thumbnail]);

  const isWalk = size === 'walk';

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center focus:outline-none"
      style={{ flexShrink: 0 }}
    >
      {/* Frame */}
      <div
        className="relative transition-transform duration-200
                   group-hover:scale-105 group-active:scale-95"
        style={{
          width: isWalk ? 260 : '100%',
          maxWidth: isWalk ? 260 : 200,
          aspectRatio: '4 / 5',
        }}
      >
        {/* Type badge */}
        {artwork.type === 'flipbook' ? (
          <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
            🎬
          </div>
        ) : null}
        {artwork.publishedUrl ? (
          <div className="absolute top-2 left-2 z-10 bg-kid-purple/80 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
            🌐
          </div>
        ) : null}
        {/* Outer frame */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #C9A84C 0%, #8B6914 50%, #C9A84C 100%)',
            padding: 8,
          }}
        >
          {/* Inner mat */}
          <div
            className="w-full h-full rounded-sm overflow-hidden"
            style={{
              background: '#FFFEF7',
              padding: 6,
            }}
          >
            {/* Artwork image */}
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={artwork.title}
                className="w-full h-full object-contain"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                <span className="text-3xl">🖼️</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plaque */}
      <div
        className="mt-3 px-4 py-2 rounded-lg text-center max-w-full"
        style={{
          background: '#2D1B69',
          color: '#F5E6D3',
          minWidth: 120,
        }}
      >
        <p className="text-sm font-bold truncate">{artwork.title}</p>
        <p className="text-xs opacity-70">
          {new Date(artwork.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </button>
  );
}
