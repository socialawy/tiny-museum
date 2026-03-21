'use client';

import type { FlipbookFrame } from '@/lib/storage/db';
import { useBlobUrl } from '@/hooks/useBlobUrl';

interface FrameStripProps {
  frames: FlipbookFrame[];
  currentIndex: number;
  onSelectFrame: (index: number) => void;
}

export function FrameStrip({ frames, currentIndex, onSelectFrame }: FrameStripProps) {
  return (
    <div
      className="flex gap-2 px-3 py-2 bg-gray-50 border-t border-gray-200 overflow-x-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      {frames.map((frame, i) => (
        <FrameThumb
          key={frame.id}
          frame={frame}
          index={i}
          isActive={i === currentIndex}
          onTap={() => onSelectFrame(i)}
        />
      ))}
    </div>
  );
}

function FrameThumb({
  frame,
  index,
  isActive,
  onTap,
}: {
  frame: FlipbookFrame;
  index: number;
  isActive: boolean;
  onTap: () => void;
}) {
  const thumbUrl = useBlobUrl(frame.thumbnail);

  return (
    <button
      onClick={onTap}
      className={`
        flex-shrink-0 flex flex-col items-center gap-1
        rounded-lg overflow-hidden transition-all duration-100
        ${isActive ? 'ring-3 ring-kid-purple scale-105 shadow-md' : 'opacity-70 hover:opacity-100'}
      `}
      style={{ width: 64 }}
    >
      <div
        className="w-full bg-white rounded overflow-hidden"
        style={{ aspectRatio: '4/3' }}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={`Frame ${index + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-xs text-gray-400">{index + 1}</span>
          </div>
        )}
      </div>
      <span className="text-[10px] font-bold text-gray-500">{index + 1}</span>
    </button>
  );
}
