'use client';

import { useState, useCallback, useEffect } from 'react';
import { PencilBrush, SprayBrush } from 'fabric';
import type { Canvas } from 'fabric';
import { BRUSHES, KID_PALETTE, type BrushKey } from '@/lib/fabric/tools';
import { BigButton } from '@/components/ui/BigButton';
import { useSounds } from '@/hooks/useSounds';

interface MiniToolbarProps {
  canvas: Canvas | null;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  /** Bump after frame load to re-apply brush (loadFromJSON resets drawing mode) */
  frameVersion?: number;
}

const TOOLS: Record<BrushKey, string> = {
  crayon: '🖍️',
  pencil: '✏️',
  marker: '🖌️',
  spray: '💨',
  eraser: '🧹',
};

export function MiniToolbar({
  canvas,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  frameVersion = 0,
}: MiniToolbarProps) {
  const [tool, setTool] = useState<BrushKey>('crayon');
  const [color, setColor] = useState<string>(KID_PALETTE[0]);
  const [size, setSize] = useState<number>(BRUSHES.crayon.width);
  const { playSound } = useSounds();

  const applyBrush = useCallback(
    (t: BrushKey, c: string, s?: number) => {
      if (!canvas) return;
      canvas.isDrawingMode = true;
      canvas.selection = false;
      canvas.discardActiveObject();
      const cfg = BRUSHES[t];
      const w = s ?? cfg.width;
      if (t === 'eraser') {
        const b = new PencilBrush(canvas);
        b.width = w;
        b.color = (canvas.backgroundColor as string) ?? '#FFFEF7';
        canvas.freeDrawingBrush = b;
      } else if (cfg.type === 'spray') {
        const b = new SprayBrush(canvas);
        b.width = w;
        b.color = c;
        canvas.freeDrawingBrush = b;
      } else {
        const b = new PencilBrush(canvas);
        b.width = w;
        b.color = c;
        b.decimate = 2;
        canvas.freeDrawingBrush = b;
      }
      canvas.renderAll();
    },
    [canvas],
  );

  // Apply default brush on canvas ready
  useEffect(() => {
    if (canvas) applyBrush('crayon', color, size);
  }, [canvas]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-apply after frame load (loadFromJSON can reset drawing mode)
  useEffect(() => {
    if (canvas && frameVersion > 0) applyBrush(tool, color, size);
  }, [frameVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectTool(k: BrushKey) {
    setTool(k);
    const newSize = BRUSHES[k].width;
    setSize(newSize);
    applyBrush(k, color, newSize);
    playSound('toolSwitch');
  }

  function selectColor(c: string) {
    setColor(c);
    if (canvas?.freeDrawingBrush && tool !== 'eraser') {
      canvas.freeDrawingBrush.color = c;
    }
    playSound('colorPop');
  }

  function changeSize(s: number) {
    setSize(s);
    if (canvas?.freeDrawingBrush) canvas.freeDrawingBrush.width = s;
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border-t-2 border-gray-100">
      {/* Tools + undo/redo */}
      <div
        className="flex items-center gap-1 px-2 py-1 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {onUndo && (
          <>
            <BigButton onClick={onUndo} disabled={!canUndo} aria-label="Undo">
              ↩️
            </BigButton>
            <BigButton onClick={onRedo} disabled={!canRedo} aria-label="Redo">
              ↪️
            </BigButton>
            <div className="w-px h-7 bg-gray-200 mx-0.5" />
          </>
        )}
        {(Object.keys(TOOLS) as BrushKey[]).map((k) => (
          <BigButton
            key={k}
            onClick={() => selectTool(k)}
            active={tool === k}
            aria-label={k}
          >
            {TOOLS[k]}
          </BigButton>
        ))}
        {tool === 'eraser' && (
          <span className="text-xs font-bold text-kid-red animate-pulse ml-1">
            Erasing
          </span>
        )}
      </div>

      {/* Brush size — hidden in landscape to save space */}
      <div className="flex items-center gap-2 px-5 pb-0.5 landscape:hidden">
        <span className="text-[10px] text-gray-400">thin</span>
        <input
          type="range"
          min={1}
          max={40}
          value={size}
          onChange={(e) => changeSize(+e.target.value)}
          className="flex-1 h-5 accent-kid-purple"
        />
        <span className="text-[10px] text-gray-400">thick</span>
      </div>

      {/* Color strip */}
      <div
        className="flex items-center gap-1.5 px-2 pb-1.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {KID_PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => selectColor(c)}
            className="flex-shrink-0 rounded-full transition-transform duration-100"
            style={{
              backgroundColor: c,
              width: 32,
              height: 32,
              border: color === c ? '3px solid #2D3436' : '2px solid #E0E0E0',
              transform: color === c ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
