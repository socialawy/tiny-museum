'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useGalleryStore } from '@/stores/gallery.store';
import { SoundToggle } from '@/components/ui/SoundToggle';

export default function HomePage() {
  const { totalCount, favoriteCount, refresh } = useGalleryStore();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center relative">
      {/* Top controls */}
      <div className="absolute top-6 right-6">
        <SoundToggle />
      </div>

      {/* Museum entrance */}
      <div className="mb-8">
        <h1 className="text-5xl font-extrabold mb-2 animate-bounce">🏛️</h1>
        <h2 className="text-4xl font-extrabold" style={{ color: '#2D1B69' }}>
          Mira&apos;s Museum
        </h2>
        <p className="text-lg mt-2 text-gray-500 font-semibold">Hi Mira! ✨ Your art lives here.</p>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-4 mb-10 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border-2 border-museum-frame/20 shadow-sm">
        <div className="px-4 border-r-2 border-museum-frame/10">
          <p className="text-2xl font-black text-kid-purple leading-none">{totalCount}</p>
          <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Artworks
          </p>
        </div>
        <div className="px-4">
          <p className="text-2xl font-black text-kid-red leading-none">{favoriteCount}</p>
          <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Favorites
          </p>
        </div>
      </div>

      {/* Two big doors */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
        <Link
          href="/gallery"
          className="flex-1 flex flex-col items-center gap-3 p-8 rounded-kid
                     bg-museum-wall border-4 border-museum-frame
                     hover:scale-105 active:scale-95
                     transition-transform duration-150 shadow-lg no-underline group"
        >
          <span className="text-5xl group-hover:scale-110 transition-transform">🖼️</span>
          <span className="text-xl font-bold text-museum-plaque">Gallery</span>
          <span className="text-sm text-gray-500">Explore your art</span>
        </Link>

        <Link
          href="/studio/canvas"
          className="flex-1 flex flex-col items-center gap-3 p-8 rounded-kid
                     bg-studio-bg border-4 border-kid-purple
                     hover:scale-105 active:scale-95
                     transition-transform duration-150 shadow-lg no-underline group"
        >
          <span className="text-5xl group-hover:rotate-12 transition-transform">🎨</span>
          <span className="text-xl font-bold text-kid-purple">Studio</span>
          <span className="text-sm text-gray-500">Create something new</span>
        </Link>
      </div>

      {/* Flipbook Door */}
      <div className="mt-6 w-full flex justify-center">
        <Link
          href="/studio/flipbook"
          className="flex flex-col items-center gap-3 p-6 rounded-kid
                     bg-white border-4 border-kid-yellow
                     hover:scale-105 active:scale-95
                     transition-transform duration-150 shadow-md no-underline
                     w-full max-w-md group"
        >
          <span className="text-4xl group-hover:scale-110 transition-transform">🎬</span>
          <span className="text-lg font-bold text-kid-dark">Flipbook</span>
          <span className="text-sm text-gray-500">Make animations!</span>
        </Link>
      </div>
    </div>
  );
}
