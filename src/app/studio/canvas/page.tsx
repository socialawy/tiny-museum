'use client';

import dynamic from 'next/dynamic';

const StudioCanvas = dynamic(
  () => import('@/components/canvas/StudioCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[100dvh] bg-studio-bg">
        <div className="text-center">
          <p className="text-5xl mb-3 animate-bounce">🎨</p>
          <p className="text-xl font-bold text-kid-purple">
            Opening Studio...
          </p>
        </div>
      </div>
    ),
  }
);

export default function StudioCanvasPage() {
  return <StudioCanvas />;
}