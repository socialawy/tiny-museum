'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  loadArtwork,
  loadArtworkBlob,
  deleteArtwork,
  renameArtwork,
  toggleFavorite,
} from '@/lib/storage/artworks';
import type { Artwork, ArtworkBlob } from '@/lib/storage/db';
import { useLargeBlob } from '@/hooks/useBlobUrl';
import { BigButton } from '@/components/ui/BigButton';
import { FriendlyDialog } from '@/components/ui/FriendlyDialog';
import { ParentGate } from '@/components/ui/ParentGate';
import Link from 'next/link';
import { loadAllFrames } from '@/lib/storage/flipbook';
import type { FlipbookFrame } from '@/lib/storage/db';
import { PlaybackOverlay } from '@/components/flipbook/PlaybackOverlay';
import Image from 'next/image';

type ModalState = 'none' | 'delete-confirm' | 'delete-gate' | 'unpublish-gate';

function FlipbookThumbnail({ artwork }: { artwork: Artwork }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!artwork.thumbnail || artwork.thumbnail.size === 0) return;
    const url = URL.createObjectURL(artwork.thumbnail);
    setThumbUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [artwork.thumbnail]);

  return thumbUrl ? (
    <Image
      src={thumbUrl}
      alt={artwork.title}
      className="w-full rounded"
      draggable={false}
      width={400}
      height={400}
      unoptimized
    />
  ) : (
    <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded">
      <span className="text-5xl">🎬</span>
    </div>
  );
}

export default function ExhibitPage() {
  const router = useRouter();
  const params = useParams();
  const artworkId = params.artworkId as string;

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [blob, setBlob] = useState<ArtworkBlob | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [modal, setModal] = useState<ModalState>('none');
  const [unpublishError, setUnpublishError] = useState<string | null>(null);
  const [isLoadingFrames, setIsLoadingFrames] = useState(false);
  const [flipbookFrames, setFlipbookFrames] = useState<FlipbookFrame[] | null>(null);

  const imageUrl = useLargeBlob(blob?.fullRes ?? null);

  useEffect(() => {
    (async () => {
      const [a, b] = await Promise.all([
        loadArtwork(artworkId),
        loadArtworkBlob(artworkId),
      ]);
      if (a) {
        setArtwork(a);
        setTitle(a.title);
      }
      if (b) setBlob(b);
    })();
  }, [artworkId]);

  if (!artwork) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-4xl animate-pulse">🖼️</p>
      </div>
    );
  }

  const isFavorite = artwork.tags.includes('favorite');

  async function handleRename() {
    if (title.trim() && title !== artwork!.title) {
      await renameArtwork(artworkId, title.trim());
      setArtwork({ ...artwork!, title: title.trim() });
    }
    setEditing(false);
  }

  async function handleFavorite() {
    await toggleFavorite(artworkId);
    const updated = await loadArtwork(artworkId);
    if (updated) setArtwork(updated);
  }

  async function handleDeleteFinal() {
    if (artwork!.type === 'flipbook') {
      const { deleteFlipbook } = await import('@/lib/storage/flipbook');
      await deleteFlipbook(artworkId);
    } else {
      await deleteArtwork(artworkId);
    }
    router.push('/gallery');
  }

  async function handleUnpublish() {
    if (!artwork) return;
    try {
      const { unpublishArtwork } = await import('@/lib/cloud/publish');
      const { updatePublishedUrl } = await import('@/lib/storage/artworks');
      await unpublishArtwork(artwork.id);
      await updatePublishedUrl(artwork.id, undefined);
      setArtwork({ ...artwork, publishedUrl: undefined });
    } catch (err) {
      console.error('Unpublish failed:', err);
      setUnpublishError('Could not unpublish. Please try again.');
    } finally {
      setModal('none');
    }
  }

  function handleEdit() {
    if (artwork!.type === 'flipbook') {
      router.push(`/studio/flipbook?id=${artworkId}`);
    } else {
      router.push(`/studio/canvas?id=${artworkId}`);
    }
  }

  async function handlePlay() {
    setIsLoadingFrames(true);
    try {
      const frames = await loadAllFrames(artworkId);
      if (frames.length === 0) {
        alert("Couldn't load animation — try opening in Studio");
        return;
      }
      setFlipbookFrames(frames);
    } catch (err) {
      console.error('Frame load failed:', err);
      alert("Couldn't load animation — try opening in Studio");
    } finally {
      setIsLoadingFrames(false);
    }
  }

  function handleDownload() {
    if (!blob) return;
    const url = URL.createObjectURL(blob.fullRes);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artwork!.title.replace(/\s+/g, '-')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  return (
    <div
      className="flex flex-col min-h-full"
      style={{
        background: 'linear-gradient(180deg, #F5E6D3 0%, #E8D5BE 100%)',
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <BigButton onClick={() => router.push('/gallery')} aria-label="Back">
          ←
        </BigButton>
        <div className="flex gap-2">
          <BigButton onClick={handleFavorite} aria-label="Favorite">
            {isFavorite ? '⭐' : '☆'}
          </BigButton>
          <BigButton onClick={handleEdit} aria-label="Edit">
            ✏️
          </BigButton>
          {artwork.type === 'flipbook' ? (
            <BigButton
              onClick={handlePlay}
              disabled={isLoadingFrames}
              aria-label="Play animation"
            >
              {isLoadingFrames ? '⏳' : '▶️'}
            </BigButton>
          ) : (
            <BigButton onClick={handleDownload} aria-label="Download">
              📥
            </BigButton>
          )}
          <BigButton onClick={() => setModal('delete-confirm')} aria-label="Delete">
            🗑️
          </BigButton>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative max-w-md w-full">
          <div
            className="rounded-xl p-3 shadow-2xl"
            style={{
              background:
                'linear-gradient(135deg, #D4A843 0%, #8B6914 30%, #D4A843 50%, #8B6914 70%, #D4A843 100%)',
            }}
          >
            <div className="bg-white p-2 rounded-lg">
              {/* Display area */}
              {artwork.type === 'flipbook' ? (
                <FlipbookThumbnail artwork={artwork} />
              ) : imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={artwork.title}
                  className="w-full rounded"
                  draggable={false}
                  width={800}
                  height={800}
                  unoptimized
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-5xl">🖼️</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center pb-8 px-6">
        <div
          className="px-8 py-4 rounded-xl text-center shadow-lg"
          style={{
            background: '#2D1B69',
            color: '#F5E6D3',
            minWidth: 200,
            maxWidth: 320,
          }}
        >
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
              className="bg-transparent text-center text-lg font-bold w-full outline-none border-b-2 border-white/30"
              style={{ color: '#F5E6D3' }}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-lg font-bold hover:underline"
              style={{ color: '#F5E6D3' }}
            >
              {artwork.title} ✏️
            </button>
          )}
          <p className="text-sm opacity-70 mt-1">
            {new Date(artwork.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {artwork.publishedUrl && (
        <div className="mt-4 px-6 pb-2 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-kid-purple font-bold">🌐 Published online</span>
            <Link href="/gallery/published" className="text-blue-600 underline text-xs">
              View gallery →
            </Link>
          </div>
          {unpublishError && <p className="text-red-500 text-xs">{unpublishError}</p>}
          <BigButton
            onClick={() => {
              setUnpublishError(null);
              setModal('unpublish-gate');
            }}
            aria-label="Unpublish"
          >
            🌐 Unpublish
          </BigButton>
        </div>
      )}

      {modal === 'delete-confirm' && (
        <FriendlyDialog
          emoji="🥺"
          title="Delete this artwork?"
          message="It will be gone forever! Are you sure?"
          confirmLabel="Yes, delete"
          confirmEmoji="🗑️"
          cancelLabel="Keep it"
          danger
          onConfirm={() => setModal('delete-gate')}
          onCancel={() => setModal('none')}
        />
      )}

      {modal === 'delete-gate' && (
        <ParentGate
          message="A grown-up needs to confirm this deletion."
          onUnlock={handleDeleteFinal}
          onCancel={() => setModal('none')}
        />
      )}

      {modal === 'unpublish-gate' && (
        <ParentGate
          message="A grown-up needs to confirm unpublishing."
          onUnlock={handleUnpublish}
          onCancel={() => setModal('none')}
        />
      )}

      {flipbookFrames &&
        (() => {
          const meta = (() => {
            try {
              return JSON.parse(artwork!.canvasJSON) as Record<string, number>;
            } catch {
              return {} as Record<string, number>;
            }
          })();
          return (
            <PlaybackOverlay
              frames={flipbookFrames}
              fps={meta.fps ?? 4}
              canvasWidth={meta.width ?? 400}
              canvasHeight={meta.height ?? 300}
              onClose={() => setFlipbookFrames(null)}
            />
          );
        })()}
    </div>
  );
}
