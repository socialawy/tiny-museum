'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import { useSounds } from '@/hooks/useSounds';
import { useUIStore } from '@/stores/ui.store';
import {
  createFlipbook,
  loadAllFrames,
  saveFrame,
  duplicateFrame,
  deleteFrame,
  updateFlipbookMeta,
} from '@/lib/storage/flipbook';
import { loadArtwork } from '@/lib/storage/artworks';
import type { FlipbookFrame } from '@/lib/storage/db';
import { BigButton } from '@/components/ui/BigButton';
import { FrameStrip } from './FrameStrip';
import { PlaybackOverlay } from './PlaybackOverlay';

interface FlipbookStudioProps {
  flipbookId?: string; // null = create new
}

export default function FlipbookStudio({ flipbookId }: FlipbookStudioProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { playSound } = useSounds();
  const celebrate = useUIStore((s) => s.celebrate);

  const { canvas, isReady } = useFabricCanvas(containerRef);

  const [artworkId, setArtworkId] = useState<string>(flipbookId ?? '');
  const [frames, setFrames] = useState<FlipbookFrame[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fps, setFps] = useState(4);
  const [onionSkin, setOnionSkin] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ── Initialize or Load ──
  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    (async () => {
      let id: string = flipbookId ?? '';

      if (!id) {
        const fb = await createFlipbook();
        id = fb.id;
      }

      setArtworkId(id);

      if (flipbookId) {
        const artwork = await loadArtwork(flipbookId);
        if (artwork) {
          try {
            const meta = JSON.parse(artwork.canvasJSON);
            setFps(meta.fps ?? 4);
          } catch {}
        }
      }

      const allFrames = await loadAllFrames(id!);
      if (!cancelled) {
        setFrames(allFrames);
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, flipbookId]);

  // ── Load frame into canvas ──
  useEffect(() => {
    if (!canvas || !loaded || frames.length === 0) return;
    const frame = frames[currentIndex];
    if (!frame) return;

    (async () => {
      try {
        const json = JSON.parse(frame.canvasJSON);
        await canvas.loadFromJSON(json);
        canvas.renderAll();
      } catch (err) {
        console.error('Frame load failed:', err);
      }
    })();
  }, [canvas, loaded, currentIndex, frames]);

  // ── Save current frame ──
  const saveCurrentFrame = useCallback(async () => {
    if (!canvas || !artworkId) return;
    try {
      // Embed the logical canvas dimensions so playback always uses the
      // dimensions from when this frame was drawn, not the current (possibly
      // rotated) canvas size.
      const raw = canvas.toJSON() as Record<string, unknown>;
      const json = JSON.stringify({
        ...raw,
        _w: canvas.getWidth(),
        _h: canvas.getHeight(),
      });
      const el = canvas.getElement() as HTMLCanvasElement;

      // Generate tiny thumbnail
      const thumb = document.createElement('canvas');
      thumb.width = 80;
      thumb.height = 60;
      const ctx = thumb.getContext('2d')!;
      ctx.drawImage(el, 0, 0, 80, 60);
      const thumbnailBlob = await new Promise<Blob>((resolve) =>
        thumb.toBlob((b) => resolve(b ?? new Blob([])), 'image/webp', 0.6),
      );

      const saved = await saveFrame(artworkId, currentIndex, json, thumbnailBlob);

      // Update local state
      setFrames((prev) => {
        const next = [...prev];
        next[currentIndex] = saved;
        return next;
      });
    } catch {}
  }, [canvas, artworkId, currentIndex]);

  // ── Navigation ──
  const goToFrame = useCallback(
    async (index: number) => {
      if (index === currentIndex) return;
      await saveCurrentFrame();
      setCurrentIndex(index);
      playSound('footstep');
    },
    [currentIndex, saveCurrentFrame, playSound],
  );

  const nextFrame = useCallback(() => {
    if (currentIndex < frames.length - 1) {
      goToFrame(currentIndex + 1);
    }
  }, [currentIndex, frames.length, goToFrame]);

  const prevFrame = useCallback(() => {
    if (currentIndex > 0) {
      goToFrame(currentIndex - 1);
    }
  }, [currentIndex, goToFrame]);

  // ── Frame Operations ──
  const addFrame = useCallback(async () => {
    if (!artworkId) return;
    await saveCurrentFrame();

    const newIndex = frames.length;
    const emptyJSON = JSON.stringify({
      version: '6.0.0',
      objects: [],
      background: '#FFFEF7',
    });

    const frame = await saveFrame(
      artworkId,
      newIndex,
      emptyJSON,
      new Blob([], { type: 'image/webp' }),
    );

    setFrames((prev) => [...prev, frame]);
    setCurrentIndex(newIndex);
    playSound('sparkle');
  }, [artworkId, frames.length, saveCurrentFrame, playSound]);

  const dupFrame = useCallback(async () => {
    if (!artworkId) return;
    await saveCurrentFrame();
    await duplicateFrame(artworkId, currentIndex);

    const allFrames = await loadAllFrames(artworkId);
    setFrames(allFrames);
    setCurrentIndex(currentIndex + 1);
    playSound('sparkle');
  }, [artworkId, currentIndex, saveCurrentFrame, playSound]);

  const removeFrame = useCallback(async () => {
    if (!artworkId || frames.length <= 1) return;
    await deleteFrame(artworkId, currentIndex);

    const allFrames = await loadAllFrames(artworkId);
    setFrames(allFrames);
    setCurrentIndex(Math.min(currentIndex, allFrames.length - 1));
    playSound('delete');
  }, [artworkId, currentIndex, frames.length, playSound]);

  // ── Playback ──
  const startPlayback = useCallback(async () => {
    await saveCurrentFrame();
    setIsPlaying(true);
    playSound('celebrate');
  }, [saveCurrentFrame, playSound]);

  // ── Send to Gallery ──
  const sendToGallery = useCallback(async () => {
    if (!canvas || !artworkId) return;
    await saveCurrentFrame();

    // Use current canvas as the thumbnail — capture at actual logical dimensions
    // so the aspect ratio matches what was drawn (canvas is fluid-sized).
    const el = canvas.getElement() as HTMLCanvasElement;
    const logW = canvas.getWidth();
    const logH = canvas.getHeight();
    const thumb = document.createElement('canvas');
    thumb.width = logW;
    thumb.height = logH;
    const ctx = thumb.getContext('2d')!;
    ctx.drawImage(el, 0, 0, logW, logH);
    const thumbnailBlob = await new Promise<Blob>((resolve) =>
      thumb.toBlob((b) => resolve(b ?? new Blob([])), 'image/webp', 0.8),
    );

    await updateFlipbookMeta(artworkId, fps, thumbnailBlob, logW, logH);
    celebrate();
    playSound('celebrate');
    setTimeout(() => router.push('/gallery'), 600);
  }, [canvas, artworkId, fps, saveCurrentFrame, celebrate, playSound, router]);

  // ── Onion Skin Rendering ──
  useEffect(() => {
    if (!canvas || !onionSkin || currentIndex === 0 || !loaded) return;
    // We render the previous frame as a faint overlay
    // This is done via a temporary canvas overlay
    const prevFrame = frames[currentIndex - 1];
    if (!prevFrame) return;

    // For now, onion skin is a visual hint in the frame strip
    // Full canvas overlay comes in polish pass
  }, [canvas, onionSkin, currentIndex, frames, loaded]);

  return (
    <div className="flex flex-col h-[100dvh] bg-studio-bg">
      {/* Top bar — only shown when loaded */}
      {loaded && (
        <div className="flex items-center justify-between px-3 py-2 bg-white/90 backdrop-blur-sm border-b-2 border-gray-100">
          <div className="flex items-center gap-2">
            <BigButton onClick={() => router.push('/gallery')} aria-label="Back">
              ←
            </BigButton>
            <span className="text-sm font-bold text-gray-500">
              🎬 Frame {currentIndex + 1}/{frames.length}
            </span>
          </div>
          <div className="flex gap-1.5">
            <BigButton onClick={sendToGallery} aria-label="Save to Gallery">
              🏛️
            </BigButton>
          </div>
        </div>
      )}

      {/* Canvas — ALWAYS in DOM so useFabricCanvas can initialize before loaded */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 relative overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-studio-bg z-30">
            <div className="text-center">
              <p className="text-5xl mb-3 animate-bounce">🎬</p>
              <p className="text-lg font-bold text-gray-400">
                Setting up your flipbook...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls — only shown when loaded */}
      {loaded && (
        <>
          {/* Frame strip */}
          <div className="flex-shrink-0 landscape:h-20 landscape:overflow-hidden">
            <FrameStrip
              frames={frames}
              currentIndex={currentIndex}
              onSelectFrame={goToFrame}
            />
          </div>

          {/* Bottom controls */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-t-2 border-gray-100">
            <div className="flex gap-2">
              <BigButton
                onClick={prevFrame}
                disabled={currentIndex === 0}
                aria-label="Previous"
              >
                ◀
              </BigButton>
              <BigButton
                onClick={nextFrame}
                disabled={currentIndex >= frames.length - 1}
                aria-label="Next"
              >
                ▶
              </BigButton>
            </div>

            <div className="flex gap-2">
              <BigButton
                onClick={() => setOnionSkin(!onionSkin)}
                active={onionSkin}
                aria-label="Onion skin"
              >
                👻
              </BigButton>
              <BigButton onClick={addFrame} aria-label="New frame">
                ＋
              </BigButton>
              <BigButton onClick={dupFrame} aria-label="Duplicate frame">
                📋
              </BigButton>
              {frames.length > 1 && (
                <BigButton onClick={removeFrame} aria-label="Delete frame">
                  🗑️
                </BigButton>
              )}
            </div>

            <BigButton
              onClick={startPlayback}
              aria-label="Play"
              className="bg-kid-green text-white"
            >
              ▶️
            </BigButton>
          </div>

          {/* Speed control */}
          <div className="flex-shrink-0 flex items-center gap-3 px-6 py-2 bg-white border-t border-gray-50">
            <span className="text-xs font-bold text-gray-400">🐢</span>
            <input
              type="range"
              min={2}
              max={12}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="flex-1 h-6 accent-kid-purple"
              aria-label="Animation speed"
            />
            <span className="text-xs font-bold text-gray-400">🐇</span>
            <span className="text-xs font-bold text-kid-purple w-12 text-right">
              {fps} fps
            </span>
          </div>
        </>
      )}

      {/* Playback overlay */}
      {isPlaying && (
        <PlaybackOverlay
          frames={frames}
          fps={fps}
          canvasWidth={canvas?.getWidth() ?? 400}
          canvasHeight={canvas?.getHeight() ?? 300}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}
