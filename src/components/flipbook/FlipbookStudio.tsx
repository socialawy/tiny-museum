'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import { FriendlyDialog } from '@/components/ui/FriendlyDialog';
import { MiniToolbar } from './MiniToolbar';
import { FrameStrip } from './FrameStrip';
import { PlaybackOverlay } from './PlaybackOverlay';

interface FlipbookStudioProps {
  flipbookId?: string;
}

export default function FlipbookStudio({ flipbookId }: FlipbookStudioProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { playSound } = useSounds();
  const celebrate = useUIStore((s) => s.celebrate);

  const { canvas, isReady, undo, redo, canUndo, canRedo } = useFabricCanvas(containerRef);

  const [artworkId, setArtworkId] = useState<string>(flipbookId ?? '');
  const [frames, setFrames] = useState<FlipbookFrame[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fps, setFps] = useState(4);
  const [onionSkin, setOnionSkin] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  // Tracks whether any real drawing has happened (fixes #24)
  const [isDirty, setIsDirty] = useState(false);
  // Incremented after each frame load so MiniToolbar re-applies brush
  const [frameVersion, setFrameVersion] = useState(0);
  // Landscape detection for compact layout (#12)
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(orientation: landscape)');
    setIsLandscape(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // ── Track dirty state via canvas events ──
  useEffect(() => {
    if (!canvas) return;
    const markDirty = () => setIsDirty(true);
    canvas.on('path:created', markDirty);
    canvas.on('object:added', markDirty);
    canvas.on('object:modified', markDirty);
    return () => {
      canvas.off('path:created', markDirty);
      canvas.off('object:added', markDirty);
      canvas.off('object:modified', markDirty);
    };
  }, [canvas]);

  // ── Initialize or Load ──
  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    (async () => {
      const id = flipbookId ?? '';

      if (id) {
        // Editing existing flipbook
        const artwork = await loadArtwork(id);
        if (artwork) {
          try {
            const meta = JSON.parse(artwork.canvasJSON);
            setFps(meta.fps ?? 4);
          } catch { /* ignore */ }
        }
        const allFrames = await loadAllFrames(id);
        if (!cancelled) {
          setArtworkId(id);
          setFrames(allFrames);
          setLoaded(true);
          setIsDirty(true); // existing flipbook counts as dirty
        }
      } else {
        // NEW flipbook — defer DB creation until first action (#24)
        // Start with a virtual empty frame in memory only
        const virtualFrame: FlipbookFrame = {
          id: '__virtual_0',
          artworkId: '__pending',
          index: 0,
          canvasJSON: JSON.stringify({
            version: '6.0.0', objects: [], background: '#FFFEF7',
          }),
          thumbnail: new Blob([], { type: 'image/webp' }),
        };
        if (!cancelled) {
          setFrames([virtualFrame]);
          setLoaded(true);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [isReady, flipbookId]);

  // ── Ensure DB entry exists (lazy creation for #24) ──
  const ensureArtworkId = useCallback(async (): Promise<string> => {
    if (artworkId && artworkId !== '') return artworkId;
    const fb = await createFlipbook();
    setArtworkId(fb.id);
    return fb.id;
  }, [artworkId]);

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
        setFrameVersion((v) => v + 1);
      } catch (err) {
        console.error('Frame load failed:', err);
      }
    })();
  }, [canvas, loaded, currentIndex, frames]);

  // ── Onion skin overlay (#23) ──
  const [onionDataUrl, setOnionDataUrl] = useState<string>('');

  useEffect(() => {
    if (!canvas || !onionSkin || currentIndex === 0 || !loaded) {
      setOnionDataUrl('');
      return;
    }
    const prevFrame = frames[currentIndex - 1];
    if (!prevFrame || prevFrame.thumbnail.size === 0) {
      setOnionDataUrl('');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') setOnionDataUrl(reader.result);
    };
    reader.readAsDataURL(prevFrame.thumbnail);
  }, [canvas, onionSkin, currentIndex, frames, loaded]);

  // ── Save current frame ──
  const saveCurrentFrame = useCallback(async () => {
    if (!canvas) return;
    const id = await ensureArtworkId();
    try {
      const raw = canvas.toJSON() as Record<string, unknown>;
      const json = JSON.stringify({
        ...raw, _w: canvas.getWidth(), _h: canvas.getHeight(),
      });
      const el = canvas.getElement() as HTMLCanvasElement;
      const thumb = document.createElement('canvas');
      thumb.width = 80;
      thumb.height = 60;
      const ctx = thumb.getContext('2d')!;
      ctx.drawImage(el, 0, 0, 80, 60);
      const thumbnailBlob = await new Promise<Blob>((resolve) =>
        thumb.toBlob((b) => resolve(b ?? new Blob([])), 'image/webp', 0.6),
      );
      const saved = await saveFrame(id, currentIndex, json, thumbnailBlob);
      setFrames((prev) => {
        const next = [...prev];
        next[currentIndex] = saved;
        return next;
      });
    } catch { /* silent */ }
  }, [canvas, currentIndex, ensureArtworkId]);

  // ── Navigation ──
  const goToFrame = useCallback(async (index: number) => {
    if (index === currentIndex) return;
    await saveCurrentFrame();
    setCurrentIndex(index);
    playSound('footstep');
  }, [currentIndex, saveCurrentFrame, playSound]);

  const nextFrame = useCallback(() => {
    if (currentIndex < frames.length - 1) goToFrame(currentIndex + 1);
  }, [currentIndex, frames.length, goToFrame]);

  const prevFrame = useCallback(() => {
    if (currentIndex > 0) goToFrame(currentIndex - 1);
  }, [currentIndex, goToFrame]);

  // ── Frame Operations ──
  const addFrame = useCallback(async () => {
    await saveCurrentFrame();
    const id = await ensureArtworkId();
    const newIndex = frames.length;
    const emptyJSON = JSON.stringify({
      version: '6.0.0', objects: [], background: '#FFFEF7',
    });
    const frame = await saveFrame(id, newIndex, emptyJSON, new Blob([], { type: 'image/webp' }));
    setFrames((prev) => [...prev, frame]);
    setCurrentIndex(newIndex);
    setIsDirty(true);
    playSound('sparkle');
  }, [frames.length, saveCurrentFrame, ensureArtworkId, playSound]);

  const dupFrame = useCallback(async () => {
    await saveCurrentFrame();
    const id = await ensureArtworkId();
    await duplicateFrame(id, currentIndex);
    const allFrames = await loadAllFrames(id);
    setFrames(allFrames);
    setCurrentIndex(currentIndex + 1);
    setIsDirty(true);
    playSound('sparkle');
  }, [currentIndex, saveCurrentFrame, ensureArtworkId, playSound]);

  const removeFrame = useCallback(async () => {
    if (frames.length <= 1) return;
    const id = await ensureArtworkId();
    await deleteFrame(id, currentIndex);
    const allFrames = await loadAllFrames(id);
    setFrames(allFrames);
    setCurrentIndex(Math.min(currentIndex, allFrames.length - 1));
    playSound('delete');
  }, [currentIndex, frames.length, ensureArtworkId, playSound]);

  // ── Playback ──
  const startPlayback = useCallback(async () => {
    await saveCurrentFrame();
    setIsPlaying(true);
    playSound('celebrate');
  }, [saveCurrentFrame, playSound]);

  // ── Send to Gallery ──
  const sendToGallery = useCallback(async () => {
    if (!canvas) return;
    await saveCurrentFrame();
    const id = await ensureArtworkId();
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
    await updateFlipbookMeta(id, fps, thumbnailBlob, logW, logH);
    celebrate();
    playSound('celebrate');
    setTimeout(() => router.push('/gallery'), 600);
  }, [canvas, fps, saveCurrentFrame, ensureArtworkId, celebrate, playSound, router]);

  // ── Exit handler (#11 — don't save empty canvas) ──
  const handleBack = useCallback(() => {
    if (isDirty) {
      setShowExitDialog(true);
    } else {
      router.push('/gallery');
    }
  }, [isDirty, router]);

  const handleExitSave = useCallback(async () => {
    setShowExitDialog(false);
    await sendToGallery();
  }, [sendToGallery]);

  const handleExitDiscard = useCallback(() => {
    setShowExitDialog(false);
    // If it was a new flipbook that never got persisted, nothing to clean up
    router.push('/gallery');
  }, [router]);

  return (
    <div className="flex flex-col h-[100dvh] bg-studio-bg">
      {/* Top bar */}
      {loaded && (
        <div
          className="flex items-center justify-between px-3 py-2 bg-white/90 backdrop-blur-sm border-b-2 border-gray-100"
          style={{
            paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))',
            paddingLeft: 'calc(0.75rem + env(safe-area-inset-left, 0px))',
            paddingRight: 'calc(0.75rem + env(safe-area-inset-right, 0px))',
          }}
        >
          <div className="flex items-center gap-2">
            <BigButton onClick={handleBack} aria-label="Back">←</BigButton>
            <span className="text-sm font-bold text-gray-500">
              🎬 {isLandscape
                ? `${currentIndex + 1}/${frames.length}`
                : `Frame ${currentIndex + 1}/${frames.length}`}
            </span>
          </div>
          <div className="flex gap-1.5">
            {/* Speed control — inline in landscape (#12) */}
            {isLandscape && (
              <div className="flex items-center gap-1 mr-2">
                <span className="text-[10px]">🐢</span>
                <input
                  type="range" min={2} max={12} value={fps}
                  onChange={(e) => setFps(+e.target.value)}
                  className="w-20 h-5 accent-kid-purple"
                />
                <span className="text-[10px]">🐇</span>
              </div>
            )}
            <BigButton onClick={startPlayback} aria-label="Play"
              className="bg-kid-green text-white">▶️</BigButton>
            <BigButton onClick={sendToGallery} aria-label="Save to Gallery">🏛️</BigButton>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 relative overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-studio-bg z-30">
            <div className="text-center">
              <p className="text-5xl mb-3 animate-bounce">🎬</p>
              <p className="text-lg font-bold text-gray-400">Setting up your flipbook...</p>
            </div>
          </div>
        )}
        {/* Onion skin overlay (#23) */}
        {onionDataUrl && (
          <Image
            src={onionDataUrl}
            alt=""
            fill
            className="object-contain pointer-events-none z-10"
            style={{ opacity: 0.25 }}
            unoptimized
            aria-hidden="true"
          />
        )}
      </div>

      {/* Controls — only when loaded */}
      {loaded && (
        <>
          {/* Drawing toolbar (#10) */}
          <div className="flex-shrink-0">
            <MiniToolbar
              canvas={canvas}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              frameVersion={frameVersion}
            />
          </div>

          {/* Frame strip — hidden in landscape, compact pill instead (#12) */}
          {isLandscape ? (
            <div className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-1 bg-gray-50 border-t border-gray-200">
              <BigButton onClick={prevFrame} disabled={currentIndex === 0}>◀</BigButton>
              <span className="text-xs font-bold text-gray-500 min-w-[60px] text-center">
                {currentIndex + 1} / {frames.length}
              </span>
              <BigButton onClick={nextFrame} disabled={currentIndex >= frames.length - 1}>▶</BigButton>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <BigButton onClick={() => setOnionSkin(!onionSkin)} active={onionSkin}>👻</BigButton>
              <BigButton onClick={addFrame}>＋</BigButton>
              <BigButton onClick={dupFrame}>📋</BigButton>
              {frames.length > 1 && <BigButton onClick={removeFrame}>🗑️</BigButton>}
            </div>
          ) : (
            <>
              {/* Portrait: full frame strip */}
              <div className="flex-shrink-0 max-h-24 overflow-hidden">
                <FrameStrip
                  frames={frames}
                  currentIndex={currentIndex}
                  onSelectFrame={goToFrame}
                />
              </div>

              {/* Portrait: controls row */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-white border-t-2 border-gray-100">
                <div className="flex gap-1.5">
                  <BigButton onClick={prevFrame} disabled={currentIndex === 0}>◀</BigButton>
                  <BigButton onClick={nextFrame} disabled={currentIndex >= frames.length - 1}>▶</BigButton>
                </div>
                <div className="flex gap-1.5">
                  <BigButton onClick={() => setOnionSkin(!onionSkin)} active={onionSkin}>👻</BigButton>
                  <BigButton onClick={addFrame}>＋</BigButton>
                  <BigButton onClick={dupFrame}>📋</BigButton>
                  {frames.length > 1 && <BigButton onClick={removeFrame}>🗑️</BigButton>}
                </div>
              </div>

              {/* Portrait: speed slider */}
              <div
                className="flex-shrink-0 flex items-center gap-3 px-6 py-1.5 bg-white border-t border-gray-50"
                style={{
                  paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))',
                }}
              >
                <span className="text-xs text-gray-400">🐢</span>
                <input
                  type="range" min={2} max={12} value={fps}
                  onChange={(e) => setFps(+e.target.value)}
                  className="flex-1 h-6 accent-kid-purple"
                />
                <span className="text-xs text-gray-400">🐇</span>
                <span className="text-xs font-bold text-kid-purple w-10 text-right">{fps} fps</span>
              </div>
            </>
          )}
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

      {/* Exit dialog (#11) */}
      {showExitDialog && (
        <FriendlyDialog
          emoji="🎬"
          title="Save your animation?"
          message="You made something cool! Want to keep it?"
          confirmLabel="Save"
          confirmEmoji="💾"
          cancelLabel="Don't save"
          onConfirm={handleExitSave}
          onCancel={handleExitDiscard}
        />
      )}
    </div>
  );
}