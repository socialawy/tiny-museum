'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { FlipbookFrame } from '@/lib/storage/db';
import { exportToGif } from '@/lib/export/gif';
import { BigButton } from '@/components/ui/BigButton';
import { useSounds } from '@/hooks/useSounds';
import { Canvas as FabricCanvas } from 'fabric';

interface PlaybackOverlayProps {
  frames: FlipbookFrame[];
  fps: number;
  canvasWidth: number;
  canvasHeight: number;
  onClose: () => void;
}

export function PlaybackOverlay({
  frames, fps, canvasWidth, canvasHeight, onClose,
}: PlaybackOverlayProps) {
  const displayRef = useRef<HTMLCanvasElement>(null);
  const preRenderedRef = useRef<HTMLCanvasElement[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [ready, setReady] = useState(false);
  const { playSound } = useSounds();

  const getFrameDims = useCallback(
    (index: number) => {
      try {
        const p = JSON.parse(frames[index]?.canvasJSON ?? '{}') as {
          _w?: number; _h?: number;
        };
        if (p._w && p._h) return { w: p._w, h: p._h };
      } catch { /* fall through */ }
      return { w: canvasWidth, h: canvasHeight };
    },
    [canvasHeight, canvasWidth, frames],
  );

  // Display size: fit first frame into viewport
  const computeDisplaySize = useCallback(() => {
    const { w, h } = getFrameDims(0);
    const maxW = window.innerWidth - 32;
    const maxH = window.innerHeight * 0.55;
    const scale = Math.min(maxW / w, maxH / h, 1);
    return { width: Math.round(w * scale), height: Math.round(h * scale) };
  }, [getFrameDims]);

  const [displaySize, setDisplaySize] = useState(computeDisplaySize);

  useEffect(() => {
    const onResize = () => setDisplaySize(computeDisplaySize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [computeDisplaySize]);

  // ── Pre-render all frames on mount (#25) ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const rendered: HTMLCanvasElement[] = [];

      for (let i = 0; i < frames.length; i++) {
        if (cancelled) return;
        const { w, h } = getFrameDims(i);
        const tmpEl = document.createElement('canvas');
        tmpEl.width = w;
        tmpEl.height = h;
        const fabric = new FabricCanvas(tmpEl, { width: w, height: h });

        try {
          const json = JSON.parse(frames[i].canvasJSON);
          await fabric.loadFromJSON(json);
          fabric.renderAll();

          // Capture to a static canvas
          const capture = document.createElement('canvas');
          capture.width = w;
          capture.height = h;
          const ctx = capture.getContext('2d')!;
          ctx.drawImage(tmpEl, 0, 0);
          rendered.push(capture);
        } catch {
          // Push blank frame on error
          const blank = document.createElement('canvas');
          blank.width = w;
          blank.height = h;
          rendered.push(blank);
        } finally {
          fabric.dispose();
        }
      }

      if (!cancelled) {
        preRenderedRef.current = rendered;
        setReady(true);
      }
    })();

    return () => { cancelled = true; };
  }, [frames, getFrameDims]);

  // ── Animation loop — just drawImage from pre-rendered ──
  useEffect(() => {
    if (!ready) return;
    const el = displayRef.current;
    const ctx = el?.getContext('2d');
    const source = preRenderedRef.current[currentFrame];
    if (el && ctx && source) {
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.drawImage(source, 0, 0, el.width, el.height);
    }

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [currentFrame, fps, frames.length, ready]);

  // ── GIF Export — reuses pre-rendered canvases ──
  const handleExportGif = useCallback(async () => {
    if (!ready) return;
    setIsExporting(true);
    playSound('save');

    try {
      const { w: gifW, h: gifH } = getFrameDims(0);
      const gifBlob = await exportToGif({
        width: gifW,
        height: gifH,
        fps,
        frames: preRenderedRef.current,
      });

      const url = URL.createObjectURL(gifBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tiny-museum-animation-${Date.now()}.gif`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      playSound('celebrate');
    } catch (err) {
      console.error('GIF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [ready, fps, playSound, getFrameDims]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
      style={{ height: '100dvh' }}
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Playback canvas */}
        <div className="rounded-kid overflow-hidden shadow-2xl bg-white" style={{ padding: 8 }}>
          {!ready ? (
            <div
              className="flex items-center justify-center"
              style={{ width: displaySize.width, height: displaySize.height }}
            >
              <p className="text-3xl animate-pulse">🎬</p>
            </div>
          ) : (
            <canvas
              ref={displayRef}
              width={displaySize.width}
              height={displaySize.height}
              className="rounded"
              style={{ width: displaySize.width, height: displaySize.height }}
            />
          )}
        </div>

        {/* Frame indicator */}
        <div className="flex gap-1">
          {frames.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-100"
              style={{
                backgroundColor: i === currentFrame ? '#6C5CE7' : 'rgba(255,255,255,0.3)',
                transform: i === currentFrame ? 'scale(1.5)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <BigButton onClick={onClose} aria-label="Close">✕</BigButton>
          <button
            onClick={handleExportGif}
            disabled={isExporting || !ready}
            className="px-6 py-3 bg-kid-purple text-white rounded-kid font-bold
                       active:scale-95 transition-transform disabled:opacity-50"
          >
            {isExporting ? '⏳ Exporting...' : '💾 Save as GIF'}
          </button>
        </div>
      </div>
    </div>
  );
}