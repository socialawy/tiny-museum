'use client';

import type { Canvas } from 'fabric';
import { BACKGROUNDS } from '@/lib/fabric/tools';
import { useSounds } from '@/hooks/useSounds';

interface BackgroundPickerProps {
  canvas: Canvas | null;
  onClose: () => void;
}

export function BackgroundPicker({ canvas, onClose }: BackgroundPickerProps) {
  const { playSound } = useSounds();

  function pickBackground(value: string) {
    if (!canvas) return;
    canvas.backgroundColor = value;
    canvas.renderAll();
    playSound('colorPop');
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold">🎨 Background</h3>
          <button onClick={onClose} className="kid-button text-sm">
            Done ✓
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {BACKGROUNDS.map(({ name, value }) => (
            <button
              key={value}
              onClick={() => pickBackground(value)}
              className="flex flex-col items-center gap-2 p-3 rounded-kid
                         border-2 border-gray-200 active:scale-95
                         transition-transform"
            >
              <div
                className="w-14 h-14 rounded-lg border border-gray-300"
                style={{ backgroundColor: value }}
              />
              <span className="text-xs font-bold text-gray-600">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
