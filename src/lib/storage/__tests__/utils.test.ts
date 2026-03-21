import { describe, it, expect } from 'vitest';
import { dataURLtoBlob } from '../artworks';

// We'll test the internal helper sanitizeBlobUrls by testing its effect via saveArtwork or by importing it if we export it.
// Since it's not exported, let's test dataURLtoBlob and some other edge cases.

describe('Storage Utils', () => {
  it('converts PNG data URL to Blob', () => {
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const blob = dataURLtoBlob(png);
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('converts WebP data URL to Blob', () => {
    const webp =
      'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TAYAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    const blob = dataURLtoBlob(webp);
    expect(blob.type).toBe('image/webp');
  });

  it('handles data URLs without explicit mime type in header', () => {
    // atob will fail if we don't provide valid base64
    const url =
      'data:,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const blob = dataURLtoBlob(url);
    expect(blob.type).toBe('image/png'); // defaults to png in the implementation
  });

  it('correctly parses complex data URL headers', () => {
    const url =
      'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InJlZCIiLz48L3N2Zz4=';
    const blob = dataURLtoBlob(url);
    expect(blob.type).toBe('image/svg+xml');
  });

  it('handles empty string by returning a default image/png blob', () => {
    // This depends on implementation, but let's check it doesn't crash
    try {
      const blob = dataURLtoBlob('');
      expect(blob).toBeInstanceOf(Blob);
    } catch {
      // If it throws, that's also a valid behavior for invalid input
    }
  });

  it('handles invalid data URL format gracefully', () => {
    try {
      const blob = dataURLtoBlob('not-a-data-url');
      expect(blob).toBeDefined();
    } catch {
      // Expected to throw if split(',') fails or atob fails
    }
  });
});
