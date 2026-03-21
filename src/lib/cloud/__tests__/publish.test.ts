import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publishArtwork, unpublishArtwork } from '../publish';
import { supabase } from '../client';
import type { Artwork } from '@/lib/storage/db';

vi.mock('../client', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: vi
        .fn()
        .mockReturnValue({ data: { publicUrl: 'https://example.com/art.png' } }),
      remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
    from: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
  },
}));

describe('Cloud Publishing', () => {
  const mockArtwork: Artwork = {
    id: 'art_123',
    title: 'Test Art',
    type: 'drawing',
    roomId: 'my-art',
    canvasJSON: '{}',
    thumbnail: new Blob([]),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: [],
  };

  const mockBlob = new Blob(['image data'], { type: 'image/png' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('publishes artwork by uploading file and upserting metadata', async () => {
    const url = await publishArtwork(mockArtwork, mockBlob);

    expect(url).toBe('https://example.com/art.png');
    expect(supabase.storage.from).toHaveBeenCalledWith('artwork-files');
    expect((supabase.storage.from('artwork-files') as any).upload).toHaveBeenCalledWith(
      'art_123.png',
      mockBlob,
      expect.any(Object),
    );
    expect(supabase.from).toHaveBeenCalledWith('published_artworks');
    expect((supabase as any).upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'art_123',
        image_url: 'https://example.com/art.png',
      }),
    );
  });

  it('throws error if upload fails', async () => {
    vi.mocked(
      (supabase.storage.from('artwork-files') as any).upload,
    ).mockResolvedValueOnce({ data: null, error: new Error('Upload failed') as any });

    await expect(publishArtwork(mockArtwork, mockBlob)).rejects.toThrow('Upload failed');
  });

  it('unpublishes artwork by deleting metadata and removing file', async () => {
    await unpublishArtwork('art_123');

    expect(supabase.from).toHaveBeenCalledWith('published_artworks');
    expect((supabase as any).delete).toHaveBeenCalled();
    expect((supabase as any).eq).toHaveBeenCalledWith('id', 'art_123');
    expect((supabase.storage.from('artwork-files') as any).remove).toHaveBeenCalledWith([
      'art_123.png',
    ]);
  });
});
