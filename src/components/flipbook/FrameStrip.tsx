'use client';

import type { FlipbookFrame } from '@/lib/storage/db';
import { useBlobUrl } from '@/hooks/useBlobUrl';
import Image from 'next/image';

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
  // Fix #13: zero-byte blobs produce a valid data URL but render as broken image
  const hasThumb = thumbUrl && frame.thumbnail && frame.thumbnail.size > 0;

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
        {hasThumb ? (
          <Image
            src={thumbUrl}
            alt={`Frame ${index + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
            width={64}
            height={48}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-lg">{index === 0 ? '🎨' : '🖼️'}</span>
          </div>
        )}
      </div>
      <span className="text-[10px] font-bold text-gray-500">{index + 1}</span>
    </button>
  );
}
