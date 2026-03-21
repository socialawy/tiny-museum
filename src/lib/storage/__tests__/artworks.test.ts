import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../db';
import {
  saveArtwork,
  loadArtwork,
  listArtworksByRoom,
  deleteArtwork,
  renameArtwork,
  toggleFavorite,
  moveArtwork,
  updatePublishedUrl,
  dataURLtoBlob,
  listAllArtworks,
  loadArtworkBlob,
} from '../artworks';

interface MockCanvasElement {
  width: number;
  height: number;
  getContext: () => { drawImage: ReturnType<typeof vi.fn> };
  toBlob: (cb: (blob: Blob) => void) => void;
  toDataURL: () => string;
}

interface MockFabricCanvas extends Record<string, unknown> {
  toJSON: () => unknown;
  toDataURL: () => string;
  getElement: () => MockCanvasElement;
  getObjects: () => unknown[];
}

/**
 * Fully mocked Fabric canvas — no real Canvas 2D needed.
 * Simulates what saveArtwork() calls on the canvas object.
 */
function createMockFabricCanvas(): MockFabricCanvas {
  // 1x1 red pixel PNG as data URL
  const tinyPng =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

  // Mock a canvas element that toBlob works on
  const mockCanvasEl: MockCanvasElement = {
    width: 100,
    height: 100,
    getContext: () => ({
      drawImage: vi.fn(),
    }),
    toBlob: (cb: (blob: Blob) => void) => {
      cb(new Blob(['thumb'], { type: 'image/webp' }));
    },
    toDataURL: () => tinyPng,
  };

  return {
    toJSON: () => ({
      version: '6.0.0',
      objects: [{ type: 'rect', left: 0, top: 0, width: 50, height: 50, fill: '#f00' }],
    }),
    toDataURL: () => tinyPng,
    getElement: () => mockCanvasEl,
    getObjects: () => [],
  };
}

describe('Artwork CRUD', () => {
  beforeEach(async () => {
    await db.artworks.clear();
    await db.blobs.clear();
  });

  it('returns empty array when listing all artworks with no data', async () => {
    const all = await listAllArtworks();
    expect(all).toEqual([]);
  });

  it('saves a new artwork and returns it with an id', async () => {
    const mockCanvas = createMockFabricCanvas();
    const artwork = await saveArtwork(mockCanvas as Record<string, unknown>);

    expect(artwork.id).toBeDefined();
    expect(artwork.id.length).toBe(12);
    expect(artwork.title).toContain('Masterpiece');
    expect(artwork.roomId).toBe('my-art');
    expect(artwork.type).toBe('drawing');
    expect(artwork.canvasJSON).toBeTruthy();
    expect(artwork.thumbnail).toBeInstanceOf(Blob);
  });

  it('loads a saved artwork by id', async () => {
    const mockCanvas = createMockFabricCanvas();
    const saved = await saveArtwork(mockCanvas as Record<string, unknown>);

    const loaded = await loadArtwork(saved.id);
    expect(loaded).toBeDefined();
    expect(loaded!.id).toBe(saved.id);
    expect(loaded!.title).toBe(saved.title);
  });

  it('updates existing artwork preserving createdAt', async () => {
    const mockCanvas = createMockFabricCanvas();
    const first = await saveArtwork(mockCanvas as Record<string, unknown>);

    await new Promise((r) => setTimeout(r, 15));
    const updated = await saveArtwork(mockCanvas as Record<string, unknown>, first.id);

    expect(updated.id).toBe(first.id);
    expect(updated.createdAt).toBe(first.createdAt);
    expect(updated.updatedAt).toBeGreaterThanOrEqual(first.updatedAt);
  });

  it('lists artworks by room in reverse chronological order', async () => {
    const mockCanvas = createMockFabricCanvas();
    await saveArtwork(mockCanvas as Record<string, unknown>);
    await new Promise((r) => setTimeout(r, 15));
    const a2 = await saveArtwork(mockCanvas as Record<string, unknown>);

    const artworks = await listArtworksByRoom('my-art');
    expect(artworks.length).toBe(2);
    expect(artworks[0].id).toBe(a2.id);
  });

  it('deletes artwork and its blob', async () => {
    const mockCanvas = createMockFabricCanvas();
    const artwork = await saveArtwork(mockCanvas as Record<string, unknown>);

    await deleteArtwork(artwork.id);
    expect(await loadArtwork(artwork.id)).toBeUndefined();
    expect(await db.blobs.get(artwork.id)).toBeUndefined();
  });

  it('renames an artwork', async () => {
    const mockCanvas = createMockFabricCanvas();
    const artwork = await saveArtwork(mockCanvas as Record<string, unknown>);

    await renameArtwork(artwork.id, 'Sunny Day');
    const loaded = await loadArtwork(artwork.id);
    expect(loaded!.title).toBe('Sunny Day');
  });

  it('toggles favorite tag on and off', async () => {
    const mockCanvas = createMockFabricCanvas();
    const artwork = await saveArtwork(mockCanvas as Record<string, unknown>);
    expect(artwork.tags).not.toContain('favorite');

    await toggleFavorite(artwork.id);
    let loaded = await loadArtwork(artwork.id);
    expect(loaded!.tags).toContain('favorite');

    await toggleFavorite(artwork.id);
    loaded = await loadArtwork(artwork.id);
    expect(loaded!.tags).not.toContain('favorite');
  });

  it('moves artwork between rooms', async () => {
    const mockCanvas = createMockFabricCanvas();
    const artwork = await saveArtwork(mockCanvas as Record<string, unknown>);
    expect(artwork.roomId).toBe('my-art');

    await moveArtwork(artwork.id, 'favorites');
    const loaded = await loadArtwork(artwork.id);
    expect(loaded!.roomId).toBe('favorites');
  });

  it('updates published URL', async () => {
    const mockCanvas = createMockFabricCanvas();
    const artwork = await saveArtwork(mockCanvas as Record<string, unknown>);

    await updatePublishedUrl(artwork.id, 'https://tiny.museum/art/123');
    let loaded = await loadArtwork(artwork.id);
    expect(loaded!.publishedUrl).toBe('https://tiny.museum/art/123');

    await updatePublishedUrl(artwork.id, undefined);
    loaded = await loadArtwork(artwork.id);
    expect(loaded!.publishedUrl).toBeUndefined();
  });

  it('lists artworks by room in reverse chronological order', async () => {
    const mockCanvas = createMockFabricCanvas();
    await saveArtwork(mockCanvas as Record<string, unknown>);
    const a2 = await saveArtwork(mockCanvas as Record<string, unknown>);
    await moveArtwork(a2.id, 'favorites');

    const myArt = await listArtworksByRoom('my-art');
    expect(myArt.length).toBe(1);

    const favorites = await listArtworksByRoom('favorites');
    expect(favorites.length).toBe(1);
    expect(favorites[0].id).toBe(a2.id);
  });

  it('lists all artworks in reverse chronological order', async () => {
    const mockCanvas = createMockFabricCanvas();
    await saveArtwork(mockCanvas as Record<string, unknown>);
    await new Promise((r) => setTimeout(r, 10));
    const a2 = await saveArtwork(mockCanvas as Record<string, unknown>);

    const all = await listAllArtworks();
    expect(all.length).toBe(2);
    expect(all[0].id).toBe(a2.id);
  });
});
