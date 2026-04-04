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
  frameVersion?: number;
  /** Single-row mode for landscape */
  compact?: boolean;
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
  compact = false,
}: MiniToolbarProps) {
  const [tool, setTool] = useState<BrushKey>('crayon');
  const [color, setColor] = useState<string>(KID_PALETTE[0]);
  const [sizes, setSizes] = useState<Record<BrushKey, number>>({
    crayon: BRUSHES.crayon.width,
    pencil: BRUSHES.pencil.width,
    marker: BRUSHES.marker.width,
    spray: BRUSHES.spray.width,
    eraser: BRUSHES.eraser.width,
  });
  const size = sizes[tool];
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

  useEffect(() => {
    if (canvas) applyBrush('crayon', color, sizes['crayon']);
  }, [canvas]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (canvas && frameVersion > 0) applyBrush(tool, color, sizes[tool]);
  }, [frameVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectTool(k: BrushKey) {
    setTool(k);
    applyBrush(k, color, sizes[k]);
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
    setSizes((prev) => ({ ...prev, [tool]: s }));
    if (canvas?.freeDrawingBrush) canvas.freeDrawingBrush.width = s;
  }

  // ── Compact: single scrollable row ──
  if (compact) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-100">
        <div
          className="flex items-center gap-1 px-2 py-0.5 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {onUndo && (
            <>
              <BigButton size="sm" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
                ↩️
              </BigButton>
              <BigButton size="sm" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
                ↪️
              </BigButton>
              <div className="w-px h-6 bg-gray-200 mx-0.5 flex-shrink-0" />
            </>
          )}
          {(Object.keys(TOOLS) as BrushKey[]).map((k) => (
            <BigButton
              size="sm"
              key={k}
              onClick={() => selectTool(k)}
              active={tool === k}
              aria-label={k}
            >
              {TOOLS[k]}
            </BigButton>
          ))}
          <div className="w-px h-6 bg-gray-200 mx-0.5 flex-shrink-0" />
          {KID_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => selectColor(c)}
              className="flex-shrink-0 rounded-full transition-transform duration-100"
              style={{
                backgroundColor: c,
                width: 24,
                height: 24,
                border: color === c ? '3px solid #2D3436' : '2px solid #E0E0E0',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Normal: multi-row layout (2 rows: tools, then slider+colors) ──
  return (
    <div className="bg-white/95 backdrop-blur-sm border-t-2 border-gray-100">
      {/* Row 1: undo/redo + drawing tools */}
      <div
        className="flex items-center gap-1 px-2 py-0.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {onUndo && (
          <>
            <BigButton size="sm" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
              ↩️
            </BigButton>
            <BigButton size="sm" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
              ↪️
            </BigButton>
            <div className="w-px h-6 bg-gray-200 mx-0.5 shrink-0" />
          </>
        )}
        {(Object.keys(TOOLS) as BrushKey[]).map((k) => (
          <BigButton
            size="sm"
            key={k}
            onClick={() => selectTool(k)}
            active={tool === k}
            aria-label={k}
          >
            {TOOLS[k]}
          </BigButton>
        ))}
        {tool === 'eraser' && (
          <span className="text-xs font-bold text-kid-red animate-pulse ml-1 shrink-0">
            Erasing
          </span>
        )}
      </div>

      {/* Row 2: brush size slider + color dots merged */}
      <div
        className="flex items-center gap-1 px-2 py-0.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <input
          type="range"
          min={1}
          max={40}
          value={size}
          onChange={(e) => changeSize(+e.target.value)}
          className="w-20 shrink-0 h-5 accent-kid-purple"
        />
        <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />
        {KID_PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => selectColor(c)}
            className="flex-shrink-0 rounded-full transition-transform duration-100"
            style={{
              backgroundColor: c,
              width: 28,
              height: 28,
              border: color === c ? '3px solid #2D3436' : '2px solid #E0E0E0',
              transform: color === c ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
