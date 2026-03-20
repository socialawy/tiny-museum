// src/components/canvas/Toolbar.tsx — REPLACE ENTIRE FILE

'use client';

import { useState } from 'react';
import { PencilBrush, SprayBrush } from 'fabric';
import type { Canvas } from 'fabric';
import { BRUSHES, KID_PALETTE, type BrushKey } from '@/lib/fabric/tools';
import { BigButton } from '@/components/ui/BigButton';
import { useSounds } from '@/hooks/useSounds';

interface ToolbarProps {
  canvas: Canvas | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onSendToGallery: () => void;
  onOpenImport: () => void;
  onOpenShapes: () => void;
  onOpenBackground: () => void;
}

const DRAW_TOOLS: Record<BrushKey, { emoji: string; label: string }> = {
  crayon: { emoji: '🖍️', label: 'Crayon' },
  pencil: { emoji: '✏️', label: 'Pencil' },
  marker: { emoji: '🖌️', label: 'Marker' },
  spray: { emoji: '💨', label: 'Spray' },
  eraser: { emoji: '🧹', label: 'Eraser' },
};

export function Toolbar({
  canvas,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onSendToGallery,
  onOpenImport,
  onOpenShapes,
  onOpenBackground,
}: ToolbarProps) {
  const [activeTool, setActiveTool] = useState<BrushKey>('crayon');
  const [activeColor, setActiveColor] = useState<string>(KID_PALETTE[0]);
  const [brushSize, setBrushSize] = useState<number>(10);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { playSound } = useSounds();

  function enterDrawMode(toolKey: BrushKey) {
    if (!canvas) return;
    setActiveTool(toolKey);
    setIsSelectMode(false);
    setBrushSize(BRUSHES[toolKey].width);
    playSound('toolSwitch');

    canvas.isDrawingMode = true;
    canvas.selection = false;
    canvas.discardActiveObject();

    if (toolKey === 'eraser') {
      const brush = new PencilBrush(canvas);
      brush.width = BRUSHES[toolKey].width;
      brush.color = (canvas.backgroundColor as string) ?? '#FFFEF7';
      canvas.freeDrawingBrush = brush;
    } else if (BRUSHES[toolKey].type === 'spray') {
      const brush = new SprayBrush(canvas);
      brush.width = BRUSHES[toolKey].width;
      brush.color = activeColor;
      canvas.freeDrawingBrush = brush;
    } else {
      const brush = new PencilBrush(canvas);
      brush.width = BRUSHES[toolKey].width;
      brush.color = activeColor;
      brush.decimate = 2;
      canvas.freeDrawingBrush = brush;
    }
    canvas.renderAll();
  }

  function enterSelectMode() {
    if (!canvas) return;
    setIsSelectMode(true);
    playSound('toolSwitch');
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.renderAll();
  }

  function selectColor(color: string) {
    if (!canvas) return;
    setActiveColor(color);
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }
    playSound('colorPop');
  }

  function changeBrushSize(newSize: number) {
    if (!canvas) return;
    setBrushSize(newSize);
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = newSize;
    }
  }

  function deleteSelected() {
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length === 0) return;
    active.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
    playSound('toolSwitch');
  }

  // Expose activeColor for shape panel
  (Toolbar as any).__activeColor = activeColor;

  return (
    <div className="flex flex-col w-full pointer-events-auto">
      {/* ── Top Bar ── */}
      <div
        className="flex items-center justify-between px-3 py-2
                      bg-white/90 backdrop-blur-sm border-b-2 border-gray-100"
      >
        <div className="flex gap-1.5">
          <BigButton onClick={onUndo} disabled={!canUndo} aria-label="Undo">
            ↩️
          </BigButton>
          <BigButton onClick={onRedo} disabled={!canRedo} aria-label="Redo">
            ↪️
          </BigButton>
        </div>
        <div className="flex gap-1.5">
          <BigButton onClick={onOpenImport} aria-label="Import image">
            📥
          </BigButton>
          <BigButton onClick={onSave} aria-label="Save">
            💾
          </BigButton>
          <BigButton onClick={onSendToGallery} aria-label="Send to Gallery">
            🏛️
          </BigButton>
        </div>
      </div>

      {/* ── Bottom Tools ── */}
      <div className="bg-white/95 backdrop-blur-sm border-t-2 border-gray-100">
        {/* Tool row 1: Mode tools */}
        <div
          className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Select/Move */}
          <BigButton
            onClick={enterSelectMode}
            active={isSelectMode}
            aria-label="Select & Move"
          >
            👆
          </BigButton>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />

          {/* Drawing tools */}
          {(Object.keys(DRAW_TOOLS) as BrushKey[]).map((key) => (
            <BigButton
              key={key}
              onClick={() => enterDrawMode(key)}
              active={!isSelectMode && activeTool === key}
              aria-label={DRAW_TOOLS[key].label}
            >
              {DRAW_TOOLS[key].emoji}
            </BigButton>
          ))}

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />

          {/* Extras */}
          <BigButton onClick={onOpenShapes} aria-label="Add shape">
            ✨
          </BigButton>
          <BigButton onClick={onOpenBackground} aria-label="Background">
            🎨
          </BigButton>

          {/* Delete selected (only visible in select mode) */}
          {isSelectMode && (
            <BigButton
              onClick={deleteSelected}
              aria-label="Delete selected"
              className="ml-auto"
            >
              🗑️
            </BigButton>
          )}
        </div>

        {/* Brush size (only in draw mode) */}
        {!isSelectMode && (
          <div className="flex items-center gap-3 px-6 pb-1">
            <span className="text-xs font-bold text-gray-400">thin</span>
            <input
              type="range"
              min={1}
              max={40}
              value={brushSize}
              onChange={(e) => changeBrushSize(Number(e.target.value))}
              className="flex-1 h-8 accent-kid-purple"
              aria-label="Brush size"
            />
            <span className="text-xs font-bold text-gray-400">thick</span>
          </div>
        )}

        {/* Color strip */}
        <div
          className="flex items-center gap-2 px-3 pb-3 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {KID_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => selectColor(color)}
              aria-label={`Color ${color}`}
              className="flex-shrink-0 rounded-full transition-transform duration-100"
              style={{
                backgroundColor: color,
                width: 40,
                height: 40,
                border: activeColor === color ? '3px solid #2D3436' : '2px solid #E0E0E0',
                transform: activeColor === color ? 'scale(1.25)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Export a way for parent to get activeColor
Toolbar.getActiveColor = () => (Toolbar as any).__activeColor ?? '#FF6B6B';
