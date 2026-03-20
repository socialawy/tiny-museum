'use client';

import { useEffect } from 'react';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add class to body so global CSS can hide the nav
  useEffect(() => {
    document.body.classList.add('studio-active');
    return () => {
      document.body.classList.remove('studio-active');
    };
  }, []);

  return <>{children}</>;
}
