'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FlipbookFrame } from '@/lib/storage/db';
import { exportToGif } from '@/lib/export/gif';
import { BigButton } from '@/components/ui/BigButton';
import { useSounds } from '@/hooks/useSounds';
import { Canvas as FabricCanvas } from 'fabric';
import Image from 'next/image';

interface PlaybackOverlayProps {
  frames: FlipbookFrame[];
  fps: number;
  canvasWidth: number;
  canvasHeight: number;
  onClose: () => void;
}

/** Render a Fabric JSON frame to a data URL — most mobile-compatible path */
async function renderFrameToDataUrl(
  json: string,
  w: number,
  h: number,
): Promise<string> {
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0.01;pointer-events:none;z-index:-1;';
  document.body.appendChild(wrapper);

  const tmpEl = document.createElement('canvas');
  tmpEl.width = w;
  tmpEl.height = h;
  wrapper.appendChild(tmpEl);

  const fabric = new FabricCanvas(tmpEl, { width: w, height: h });

  try {
    const parsed = JSON.parse(json);
    await fabric.loadFromJSON(parsed);
    fabric.renderAll();
    return fabric.toDataURL({ format: 'png', multiplier: 1 });
  } finally {
    fabric.dispose();
    document.body.removeChild(wrapper);
  }
}

/** Convert a data URL to an HTMLCanvasElement (for GIF export) */
function dataUrlToCanvas(
  dataUrl: string,
  w: number,
  h: number,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c);
    };
    img.src = dataUrl;
  });
}

export function PlaybackOverlay({
  frames, fps, canvasWidth, canvasHeight, onClose,
}: PlaybackOverlayProps) {
  const [frameUrls, setFrameUrls] = useState<string[]>([]);
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

  // ── Pre-render all frames to data URLs ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const urls: string[] = [];

      for (let i = 0; i < frames.length; i++) {
        if (cancelled) return;
        const { w, h } = getFrameDims(i);
        try {
          const url = await renderFrameToDataUrl(frames[i].canvasJSON, w, h);
          urls.push(url);
        } catch {
          // Transparent 1x1 fallback
          urls.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
        }
      }

      if (!cancelled) {
        setFrameUrls(urls);
        setReady(true);
      }
    })();

    return () => { cancelled = true; };
  }, [frames, getFrameDims]);

  // ── Animation loop — just swap image src ──
  useEffect(() => {
    if (!ready || frameUrls.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameUrls.length);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [fps, frameUrls.length, ready]);

  // ── GIF Export ──
  const handleExportGif = useCallback(async () => {
    if (!ready) return;
    setIsExporting(true);
    playSound('save');

    try {
      const { w: gifW, h: gifH } = getFrameDims(0);
      const canvases: HTMLCanvasElement[] = [];

      for (const url of frameUrls) {
        const c = await dataUrlToCanvas(url, gifW, gifH);
        canvases.push(c);
      }

      const gifBlob = await exportToGif({
        width: gifW,
        height: gifH,
        fps,
        frames: canvases,
      });

      const blobUrl = URL.createObjectURL(gifBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `tiny-museum-animation-${Date.now()}.gif`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      playSound('celebrate');
    } catch (err) {
      console.error('GIF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [ready, fps, playSound, getFrameDims, frameUrls]);

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
        {/* Playback display */}
        <div className="rounded-kid overflow-hidden shadow-2xl bg-white" style={{ padding: 8 }}>
          {!ready ? (
            <div
              className="flex items-center justify-center"
              style={{ width: displaySize.width, height: displaySize.height }}
            >
              <p className="text-3xl animate-pulse">🎬</p>
            </div>
          ) : (
            <Image
              src={frameUrls[currentFrame] ?? ''}
              alt={`Frame ${currentFrame + 1}`}
              width={displaySize.width}
              height={displaySize.height}
              className="rounded"
              style={{ width: displaySize.width, height: displaySize.height }}
              unoptimized
              priority
            />
          )}
        </div>

        {/* Frame dots */}
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