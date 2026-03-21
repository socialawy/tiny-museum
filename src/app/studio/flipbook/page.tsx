'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const FlipbookStudio = dynamic(() => import('@/components/flipbook/FlipbookStudio'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[100dvh] bg-studio-bg">
      <div className="text-center">
        <p className="text-5xl mb-3 animate-bounce">🎬</p>
        <p className="text-xl font-bold text-kid-purple">Opening Flipbook Studio...</p>
      </div>
    </div>
  ),
});

function FlipbookPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? undefined;
  return <FlipbookStudio flipbookId={id} />;
}

export default function FlipbookPageWrapper() {
  return (
    <Suspense>
      <FlipbookPage />
    </Suspense>
  );
}
