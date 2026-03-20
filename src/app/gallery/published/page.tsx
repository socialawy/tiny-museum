import { fetchPublishedArtworks } from '@/lib/cloud/gallery';
import type { PublishedArtwork } from '@/lib/cloud/types';
import { PublishedGallery } from '@/components/gallery/PublishedGallery';
import Link from 'next/link';

export const revalidate = 60;

export const metadata = {
  title: 'Tiny Museum — Gallery',
  description: 'A tiny museum of original artwork',
};

export default async function PublishedGalleryPage() {
  let artworks: PublishedArtwork[] = [];
  try {
    artworks = await fetchPublishedArtworks();
  } catch (err) {
    console.error('Failed to fetch published artworks:', err);
    artworks = [];
  }

  return (
    <main className="min-h-screen bg-museum-canvas">
      <header className="flex items-center justify-between px-4 py-3 border-b border-kid-yellow/30">
        <h1 className="text-xl font-extrabold text-kid-purple">🏛️ Tiny Museum</h1>
        <Link href="/gallery" className="text-sm text-kid-purple font-bold underline">
          My Art
        </Link>
      </header>
      <PublishedGallery artworks={artworks} />
    </main>
  );
}
