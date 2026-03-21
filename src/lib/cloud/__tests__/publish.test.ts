import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Artwork } from '@/lib/storage/db';

// Mock the supabase client before importing publish
const mockUpload = vi.fn().mockResolvedValue({ error: null });
const mockRemove = vi.fn().mockResolvedValue({ error: null });
const mockGetPublicUrl = vi.fn().mockReturnValue({
  data: {
    publicUrl:
      'https://example.supabase.co/storage/v1/object/public/artwork-files/test-id.png',
  },
});
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockEq = vi.fn().mockReturnValue({ error: null });
const mockSelect = vi.fn().mockReturnValue({
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
});

vi.mock('../client', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'published_artworks') {
        return {
          upsert: mockUpsert,
          delete: () => ({ eq: mockEq }),
          select: mockSelect,
        };
      }
    }),
  },
}));

const mockArtwork: Artwork = {
  id: 'test-id',
  title: 'My Painting',
  roomId: 'my-art',
  type: 'drawing',
  thumbnail: new Blob(),
  canvasJSON: '{}',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tags: [],
};

describe('publishArtwork', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads PNG to Supabase Storage', async () => {
    const { publishArtwork } = await import('../publish');
    const imageBlob = new Blob(['fake-png'], { type: 'image/png' });
    await publishArtwork(mockArtwork, imageBlob);
    expect(mockUpload).toHaveBeenCalledWith(
      'test-id.png',
      imageBlob,
      expect.objectContaining({ contentType: 'image/png', upsert: true }),
    );
  });

  it('inserts row into published_artworks', async () => {
    const { publishArtwork } = await import('../publish');
    const imageBlob = new Blob(['fake-png'], { type: 'image/png' });
    await publishArtwork(mockArtwork, imageBlob);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-id', title: 'My Painting', type: 'drawing' }),
    );
  });

  it('returns the public URL', async () => {
    const { publishArtwork } = await import('../publish');
    const imageBlob = new Blob(['fake-png'], { type: 'image/png' });
    const url = await publishArtwork(mockArtwork, imageBlob);
    expect(url).toContain('test-id.png');
  });
});

describe('unpublishArtwork', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes from published_artworks table', async () => {
    const { unpublishArtwork } = await import('../publish');
    await unpublishArtwork('test-id');
    expect(mockEq).toHaveBeenCalledWith('id', 'test-id');
  });

  it('removes file from Storage', async () => {
    const { unpublishArtwork } = await import('../publish');
    await unpublishArtwork('test-id');
    expect(mockRemove).toHaveBeenCalledWith(['test-id.png']);
  });
});

describe('fetchPublishedArtworks', () => {
  it('returns empty array when no artworks published', async () => {
    const { fetchPublishedArtworks } = await import('../gallery');
    const result = await fetchPublishedArtworks();
    expect(result).toEqual([]);
  });

  it('returns artworks array from Supabase', async () => {
    // Override mock for this test to return data
    const mockData = [
      {
        id: 'a1',
        title: 'Test',
        type: 'drawing',
        image_url: 'https://example.com/a1.png',
        room_name: 'my-art',
        published_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];
    mockSelect.mockReturnValueOnce({
      order: vi.fn().mockResolvedValueOnce({ data: mockData, error: null }),
    });
    const { fetchPublishedArtworks: fetchAgain } = await import('../gallery');
    const result = await fetchAgain();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a1');
  });

  it('throws when Supabase returns an error', async () => {
    mockSelect.mockReturnValueOnce({
      order: vi.fn().mockResolvedValueOnce({ data: null, error: new Error('DB error') }),
    });
    const { fetchPublishedArtworks: fetchError } = await import('../gallery');
    await expect(fetchError()).rejects.toThrow('DB error');
  });
});
