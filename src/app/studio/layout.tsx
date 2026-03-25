'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PinGate } from '@/components/ui/PinGate';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Add class to body so global CSS can hide the nav
  useEffect(() => {
    document.body.classList.add('studio-active');
    return () => {
      document.body.classList.remove('studio-active');
    };
  }, []);

  return (
    <>
      {!isUnlocked && (
        <PinGate onUnlock={() => setIsUnlocked(true)} onCancel={() => router.push('/')} />
      )}
      {isUnlocked && children}
    </>
  );
}
