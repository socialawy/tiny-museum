'use client';

import { useState, useEffect } from 'react';

/**
 * Converts a Blob to a stable data URL.
 * Immune to React strict mode, HMR, and re-render cycles.
 * Works for any size — modern browsers handle large data URLs fine.
 */
export function useBlobUrl(blob: Blob | null | undefined): string {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    if (!blob) {
      setUrl('');
      return;
    }

    let cancelled = false;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (!cancelled && typeof reader.result === 'string') {
        setUrl(reader.result);
      }
    };
    reader.readAsDataURL(blob);

    return () => {
      cancelled = true;
    };
  }, [blob]);

  return url;
}

// Keep backward compat — same implementation now
export const useLargeBlob = useBlobUrl;
