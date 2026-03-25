'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilBrush, SprayBrush } from 'fabric';
import type { Canvas } from 'fabric';
import { BRUSHES, KID_PALETTE, type BrushKey } from '@/lib/fabric/tools';
import { BigButton } from '@/components/ui/BigButton';
import { useSounds } from '@/hooks/useSounds';

interface ToolbarProps {
  canvas: Canvas | null;
  activeColor: string;
  onColorChange: (color: string) => void;
  isSelectMode: boolean;
  onSelectModeChange: (isSelect: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onSendToGallery: () => void;
  onPublish?: () => void;
  publishing?: boolean;
  publishedLink?: string | null;
  onOpenImport: () => void;
  onOpenShapes: () => void;
  onOpenBackground: () => void;
  onOpenStickers: () => void;
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
  activeColor,
  onColorChange,
  isSelectMode,
  onSelectModeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onSendToGallery,
  onPublish,
  publishing = false,
  publishedLink = null,
  onOpenImport,
  onOpenShapes,
  onOpenBackground,
  onOpenStickers,
}: ToolbarProps) {
  const [activeTool, setActiveTool] = useState<BrushKey>('crayon');
  const [brushSizes, setBrushSizes] = useState<Record<BrushKey, number>>({
    crayon: BRUSHES.crayon.width,
    pencil: BRUSHES.pencil.width,
    marker: BRUSHES.marker.width,
    spray: BRUSHES.spray.width,
    eraser: BRUSHES.eraser.width,
  });
  const brushSize = brushSizes[activeTool];
  const { playSound } = useSounds();

  // Listen for canvas switching to select mode externally
  // (e.g. after shape/sticker add)
  useEffect(() => {
    if (!canvas) return;

    const checkMode = () => {
      if (!canvas.isDrawingMode && !isSelectMode) {
        onSelectModeChange(true);
      }
    };

    canvas.on('selection:created', checkMode);
    canvas.on('selection:updated', checkMode);

    return () => {
      canvas.off('selection:created', checkMode);
      canvas.off('selection:updated', checkMode);
    };
  }, [canvas, isSelectMode, onSelectModeChange]);

  const applyBrush = useCallback(
    (toolKey: BrushKey, color: string) => {
      if (!canvas) return;

      canvas.isDrawingMode = true;
      canvas.selection = false;
      canvas.discardActiveObject();

      const tool = BRUSHES[toolKey];

      if (toolKey === 'eraser') {
        const brush = new PencilBrush(canvas);
        brush.width = tool.width;
        // Reverting to solid/pattern painting as requested
        // Supports both hex colors and fabric.Pattern
        const bgColor = (canvas.backgroundColor as string | null) ?? '#FFFEF7';
        brush.color = bgColor;
        canvas.freeDrawingBrush = brush;
      } else if (tool.type === 'spray') {
        const brush = new SprayBrush(canvas);
        brush.width = tool.width;
        brush.color = color;
        canvas.freeDrawingBrush = brush;
      } else {
        const brush = new PencilBrush(canvas);
        brush.width = tool.width;
        brush.color = color;
        brush.decimate = 2;
        canvas.freeDrawingBrush = brush;
      }
      canvas.renderAll();
    },
    [canvas],
  );

  function enterDrawMode(toolKey: BrushKey) {
    if (!canvas) return;
    setActiveTool(toolKey);
    onSelectModeChange(false);
    playSound('toolSwitch');
    applyBrush(toolKey, activeColor);
    // Restore that tool's remembered size
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSizes[toolKey];
    }
  }

  function enterSelectMode() {
    if (!canvas) return;
    onSelectModeChange(true);
    playSound('toolSwitch');
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.renderAll();
  }

  function selectColor(color: string) {
    if (!canvas) return;
    onColorChange(color);
    // If in draw mode, update the brush color immediately
    if (!isSelectMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }
    playSound('colorPop');
  }

  function changeBrushSize(newSize: number) {
    if (!canvas) return;
    setBrushSizes((prev) => ({ ...prev, [activeTool]: newSize }));
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

  return (
    <div className="flex flex-col w-full pointer-events-auto">
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-white/90 backdrop-blur-sm border-b-2 border-gray-100"
        style={{
          paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))',
          paddingLeft: 'calc(0.75rem + env(safe-area-inset-left, 0px))',
          paddingRight: 'calc(0.75rem + env(safe-area-inset-right, 0px))',
        }}
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
          <BigButton onClick={onOpenImport} aria-label="Import">
            📥
          </BigButton>
          <BigButton onClick={onSave} aria-label="Save">
            💾
          </BigButton>
          <BigButton onClick={onSendToGallery} aria-label="Gallery">
            🏛️
          </BigButton>
          {onPublish && (
            <BigButton
              onClick={onPublish}
              disabled={publishing}
              aria-label="Publish online"
            >
              {publishing ? '⏳' : publishedLink ? '✅' : '🌐'}
            </BigButton>
          )}
        </div>
      </div>

      {/* Bottom Tools */}
      <div
        className="bg-white/95 backdrop-blur-sm border-t-2 border-gray-100"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <div
          className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Select/Move */}
          <BigButton onClick={enterSelectMode} active={isSelectMode} aria-label="Select">
            👆
          </BigButton>

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

          <div className="w-px h-8 bg-gray-200 mx-1" />

          {/* Extras */}
          <BigButton onClick={onOpenShapes} aria-label="Shapes">
            ✨
          </BigButton>
          <BigButton onClick={onOpenStickers} aria-label="Stickers">
            🎯
          </BigButton>
          <BigButton onClick={onOpenBackground} aria-label="Background">
            🎨
          </BigButton>

          {/* Eraser mode indicator */}
          {!isSelectMode && activeTool === 'eraser' && (
            <span className="text-xs font-bold text-kid-red ml-2 animate-pulse">
              Erasing
            </span>
          )}

          {/* Delete selected */}
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

        {/* Brush size — only in draw mode */}
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
