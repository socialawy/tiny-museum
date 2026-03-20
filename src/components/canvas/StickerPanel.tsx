'use client';

import { useState } from 'react';
import type { Canvas } from 'fabric';
import { STICKER_PACKS, type StickerPack } from '@/assets/stickers';
import { addStickerToCanvas } from '@/lib/fabric/stickers';
import { useSounds } from '@/hooks/useSounds';

interface StickerPanelProps {
  canvas: Canvas | null;
  onClose: () => void;
}

export function StickerPanel({ canvas, onClose }: StickerPanelProps) {
  const [activePack, setActivePack] = useState<StickerPack>(STICKER_PACKS[0]);
  const { playSound } = useSounds();

  async function handleSticker(emoji: string) {
    if (!canvas) return;
    await addStickerToCanvas(canvas, emoji, 80);
    playSound('toolSwitch');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-kid w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '60vh' }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-lg font-extrabold">🎨 Stickers</h3>
          <button onClick={onClose} className="kid-button text-sm">
            Done ✓
          </button>
        </div>

        <div
          className="flex gap-2 px-4 pb-3 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {STICKER_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setActivePack(pack)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full
                font-bold text-sm whitespace-nowrap transition-all
                ${
                  activePack.id === pack.id
                    ? 'bg-kid-purple text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
            >
              <span>{pack.icon}</span>
              <span>{pack.name}</span>
            </button>
          ))}
        </div>

        <div
          className="grid grid-cols-4 gap-2 px-4 pb-5 overflow-y-auto"
          style={{ maxHeight: '35vh' }}
        >
          {activePack.stickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => handleSticker(sticker.emoji)}
              className="flex flex-col items-center gap-1 p-3 rounded-kid
                         bg-gray-50 active:scale-90
                         transition-all duration-100"
            >
              <span className="text-3xl">{sticker.emoji}</span>
              <span className="text-[10px] font-bold text-gray-500">{sticker.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
