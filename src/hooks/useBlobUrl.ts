'use client';

import { useState, useEffect } from 'react';

/**
 * Creates a blob URL from a Blob and properly revokes it on unmount
 * or when the blob reference changes.
 */
export function useBlobUrl(blob: Blob | null | undefined): string {
    const [url, setUrl] = useState<string>('');

    useEffect(() => {
        if (!blob) {
            setUrl('');
            return;
        }

        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [blob]);

    return url;
}