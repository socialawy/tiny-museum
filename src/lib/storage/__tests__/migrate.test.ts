import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { cleanExpiredBlobUrls } from '../migrate';

describe('cleanExpiredBlobUrls', () => {
  beforeEach(async () => {
    await db.artworks.clear();
    await db.settings.clear();
  });

  it('replaces blob URLs in canvasJSON', async () => {
    await db.artworks.add({
      id: 'test-blob',
      title: 'Test',
      roomId: 'my-art',
      type: 'drawing',
      thumbnail: new Blob(['thumb']),
      canvasJSON: JSON.stringify({
        objects: [
          {
            type: 'image',
            src: 'blob:http://localhost:3000/abc-123-def',
            left: 0,
            top: 0,
          },
        ],
      }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
    });

    const patched = await cleanExpiredBlobUrls();
    expect(patched).toBe(1);

    const artwork = await db.artworks.get('test-blob');
    expect(artwork!.canvasJSON).not.toContain('blob:');
  });

  it('skips artworks without blob URLs', async () => {
    await db.artworks.add({
      id: 'test-clean',
      title: 'Clean',
      roomId: 'my-art',
      type: 'drawing',
      thumbnail: new Blob(['thumb']),
      canvasJSON: JSON.stringify({
        objects: [
          {
            type: 'image',
            src: 'data:image/png;base64,abc123',
            left: 0,
            top: 0,
          },
        ],
      }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
    });

    const patched = await cleanExpiredBlobUrls();
    expect(patched).toBe(0);
  });

  it('returns 0 when no artworks exist', async () => {
    const patched = await cleanExpiredBlobUrls();
    expect(patched).toBe(0);
  });
});
