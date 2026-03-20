// src/app/gallery/[artworkId]/page.tsx — REPLACE ENTIRE FILE

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
import { BigButton } from '@/components/ui/BigButton';
import { FriendlyDialog } from '@/components/ui/FriendlyDialog';
import { ParentGate } from '@/components/ui/ParentGate';

type ModalState = 'none' | 'delete-confirm' | 'delete-gate';

export default function ExhibitPage() {
  const router = useRouter();
  const params = useParams();
  const artworkId = params.artworkId as string;

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [blob, setBlob] = useState<ArtworkBlob | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [modal, setModal] = useState<ModalState>('none');

  useEffect(() => {
    let revoke = '';
    async function load() {
      const [a, b] = await Promise.all([
        loadArtwork(artworkId),
        loadArtworkBlob(artworkId),
      ]);
      if (a) {
        setArtwork(a);
        setTitle(a.title);
      }
      if (b) {
        setBlob(b);
        const url = URL.createObjectURL(b.fullRes);
        revoke = url;
        setImageUrl(url);
      }
    }
    load();
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
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

  function handleDeleteTap() {
    setModal('delete-confirm');
  }

  function handleDeleteConfirmed() {
    // After friendly dialog, require parent gate
    setModal('delete-gate');
  }

  async function handleDeleteFinal() {
    await deleteArtwork(artworkId);
    router.push('/gallery');
  }

  function handleEdit() {
    router.push(`/studio/canvas?id=${artworkId}`);
  }

  function handleDownload() {
    if (!blob) return;
    const url = URL.createObjectURL(blob.fullRes);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artwork!.title.replace(/\s+/g, '-')}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="flex flex-col min-h-full"
      style={{
        background: 'linear-gradient(180deg, #F5E6D3 0%, #E8D5BE 100%)',
      }}
    >
      {/* Top bar */}
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
          <BigButton onClick={handleDownload} aria-label="Download">
            📥
          </BigButton>
          <BigButton onClick={handleDeleteTap} aria-label="Delete">
            🗑️
          </BigButton>
        </div>
      </div>

      {/* Framed artwork */}
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
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={artwork.title}
                  className="w-full rounded"
                  draggable={false}
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

      {/* Plaque */}
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
              className="bg-transparent text-center text-lg font-bold w-full
                         outline-none border-b-2 border-white/30"
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

      {/* ── Modals ── */}

      {modal === 'delete-confirm' && (
        <FriendlyDialog
          emoji="🥺"
          title="Delete this artwork?"
          message="It will be gone forever! Are you sure?"
          confirmLabel="Yes, delete"
          confirmEmoji="🗑️"
          cancelLabel="Keep it"
          danger
          onConfirm={handleDeleteConfirmed}
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
    </div>
  );
}
