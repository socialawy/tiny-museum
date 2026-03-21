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
  frames,
  fps,
  canvasWidth,
  canvasHeight,
  onClose,
}: PlaybackOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const { playSound } = useSounds();

  // Use per-frame stored dimensions (_w/_h) if available — this is the size
  // the frame was actually drawn at, which may differ from the current canvas
  // size if the device was rotated after drawing.
  function getFrameDims(index: number) {
    try {
      const p = JSON.parse(frames[index]?.canvasJSON ?? '{}') as { _w?: number; _h?: number };
      if (p._w && p._h) return { w: p._w, h: p._h };
    } catch { /* fall through */ }
    return { w: canvasWidth, h: canvasHeight };
  }

  // Display size: fit the first frame's drawing dimensions into the viewport.
  function computeDisplaySize() {
    const { w, h } = getFrameDims(0);
    const maxW = window.innerWidth - 32;
    const maxH = window.innerHeight * 0.55; // leave room for dots + buttons
    const scale = Math.min(maxW / w, maxH / h, 1);
    return { width: Math.round(w * scale), height: Math.round(h * scale) };
  }
  const [displaySize, setDisplaySize] = useState(computeDisplaySize);
  useEffect(() => {
    function onResize() { setDisplaySize(computeDisplaySize()); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasWidth, canvasHeight, frames]);

  // Render frame to canvas
  const renderFrame = useCallback(
    async (index: number) => {
      const el = canvasRef.current;
      if (!el || !frames[index]) return;

      const ctx = el.getContext('2d');
      if (!ctx) return;

      // Create a temporary Fabric canvas using the dimensions the frame was
      // drawn at (stored as _w/_h in the JSON), not the current canvas size.
      const { w: fw, h: fh } = getFrameDims(index);
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = fw;
      tmpCanvas.height = fh;
      const fabric = new FabricCanvas(tmpCanvas, {
        width: fw,
        height: fh,
      });

      try {
        const json = JSON.parse(frames[index].canvasJSON);
        await fabric.loadFromJSON(json);
        fabric.renderAll();

        // Draw to our display canvas
        ctx.clearRect(0, 0, el.width, el.height);
        ctx.drawImage(tmpCanvas, 0, 0, el.width, el.height);
      } catch (err) {
        console.error('Frame render failed:', err);
      } finally {
        fabric.dispose();
      }
    },
    [frames, canvasWidth, canvasHeight],
  );

  // Animation loop
  useEffect(() => {
    renderFrame(currentFrame);

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [currentFrame, fps, frames.length, renderFrame]);

  // GIF Export
  const handleExportGif = useCallback(async () => {
    setIsExporting(true);
    playSound('save');

    try {
      const exportFrames: HTMLCanvasElement[] = [];

      for (let fi = 0; fi < frames.length; fi++) {
        const frame = frames[fi];
        const { w: fw, h: fh } = getFrameDims(fi);
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = fw;
        tmpCanvas.height = fh;
        const fabric = new FabricCanvas(tmpCanvas, {
          width: fw,
          height: fh,
        });

        const json = JSON.parse(frame.canvasJSON);
        await fabric.loadFromJSON(json);
        fabric.renderAll();

        // Capture the rendered frame
        const capture = document.createElement('canvas');
        capture.width = fw;
        capture.height = fh;
        const ctx = capture.getContext('2d')!;
        ctx.drawImage(tmpCanvas, 0, 0);
        exportFrames.push(capture);

        fabric.dispose();
      }

      const { w: gifW, h: gifH } = getFrameDims(0);
      const gifBlob = await exportToGif({
        width: gifW,
        height: gifH,
        fps,
        frames: exportFrames,
      });

      // Download
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
  }, [frames, fps, canvasWidth, canvasHeight, playSound]);

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
        <div
          className="rounded-kid overflow-hidden shadow-2xl bg-white"
          style={{ padding: 8 }}
        >
          <canvas
            ref={canvasRef}
            width={displaySize.width}
            height={displaySize.height}
            className="rounded"
            style={{ width: displaySize.width, height: displaySize.height }}
          />
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
          <BigButton onClick={onClose} aria-label="Close">
            ✕
          </BigButton>
          <button
            onClick={handleExportGif}
            disabled={isExporting}
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
