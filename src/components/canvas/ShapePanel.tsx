'use client';

import type { Canvas } from 'fabric';
import { addCircle, addSquare, addStar, addHeart } from '@/lib/fabric/shapes';
import { useSounds } from '@/hooks/useSounds';

interface ShapePanelProps {
  canvas: Canvas | null;
  activeColor: string;
  onClose: () => void;
}

const SHAPES = [
  { key: 'circle', emoji: '⭕', label: 'Circle', fn: addCircle },
  { key: 'square', emoji: '⬜', label: 'Square', fn: addSquare },
  { key: 'star', emoji: '⭐', label: 'Star', fn: addStar },
  { key: 'heart', emoji: '❤️', label: 'Heart', fn: addHeart },
];

export function ShapePanel({ canvas, activeColor, onClose }: ShapePanelProps) {
  const { playSound } = useSounds();

  function insertShape(fn: (c: Canvas, color: string) => void) {
    if (!canvas) return;
    canvas.isDrawingMode = false;
    fn(canvas, activeColor);
    playSound('toolSwitch');
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-kid w-full max-w-md p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-extrabold mb-4">✨ Add a Shape</h3>
        <div className="grid grid-cols-4 gap-3">
          {SHAPES.map(({ key, emoji, label, fn }) => (
            <button
              key={key}
              onClick={() => insertShape(fn)}
              className="flex flex-col items-center gap-2 p-4 rounded-kid
                         bg-studio-bg active:scale-90 transition-transform"
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
