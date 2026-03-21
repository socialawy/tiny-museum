import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import {
  saveFrame,
  loadFrame,
  loadAllFrames,
  getFrameCount,
  deleteFrame,
  duplicateFrame,
  createFlipbook,
  updateFlipbookMeta,
  deleteFlipbook,
} from '../flipbook';

describe('Flipbook CRUD', () => {
  beforeEach(async () => {
    await db.artworks.clear();
    await db.frames.clear();
    await db.blobs.clear();
  });

  it('creates a flipbook with an initial empty frame', async () => {
    const artwork = await createFlipbook('My Movie');
    expect(artwork.id).toBeDefined();
    expect(artwork.type).toBe('flipbook');

    const frames = await loadAllFrames(artwork.id);
    expect(frames.length).toBe(1);
    expect(frames[0].index).toBe(0);
  });

  it('saves and loads a frame', async () => {
    const artworkId = 'test_fb';
    const blob = new Blob(['frame data'], { type: 'image/webp' });
    await saveFrame(artworkId, 0, '{"objects":[]}', blob);

    const frame = await loadFrame(artworkId, 0);
    expect(frame).toBeDefined();
    expect(frame!.index).toBe(0);
    expect(frame!.canvasJSON).toBe('{"objects":[]}');
  });

  it('duplicates a frame and shifts subsequent frames', async () => {
    const id = 'test_fb';
    await saveFrame(id, 0, '{"f": 0}', new Blob([]));
    await saveFrame(id, 1, '{"f": 1}', new Blob([]));

    await duplicateFrame(id, 0);

    const frames = await loadAllFrames(id);
    expect(frames.length).toBe(3);
    expect(frames[1].canvasJSON).toBe('{"f": 0}'); // duplicated
    expect(frames[2].index).toBe(2);
    expect(frames[2].canvasJSON).toBe('{"f": 1}'); // shifted
  });

  it('deletes a frame and re-indexes remaining frames', async () => {
    const id = 'test_fb';
    await saveFrame(id, 0, '{"f": 0}', new Blob([]));
    await saveFrame(id, 1, '{"f": 1}', new Blob([]));
    await saveFrame(id, 2, '{"f": 2}', new Blob([]));

    await deleteFrame(id, 1);

    const frames = await loadAllFrames(id);
    expect(frames.length).toBe(2);
    expect(frames[1].index).toBe(1);
    expect(frames[1].canvasJSON).toBe('{"f": 2}'); // re-indexed
  });

  it('updates flipbook metadata', async () => {
    const artwork = await createFlipbook('Meta Test');
    const thumb = new Blob(['thumb'], { type: 'image/webp' });

    await updateFlipbookMeta(artwork.id, 8, thumb, 800, 600);

    const updated = await db.artworks.get(artwork.id);
    const meta = JSON.parse(updated!.canvasJSON);
    expect(meta.fps).toBe(8);
  });

  it('deletes flipbook and all its frames', async () => {
    const artwork = await createFlipbook('Cleanup Test');
    await saveFrame(artwork.id, 1, '{}', new Blob([]));

    await deleteFlipbook(artwork.id);

    expect(await db.artworks.get(artwork.id)).toBeUndefined();
    const frames = await loadAllFrames(artwork.id);
    expect(frames.length).toBe(0);
  });

  it('returns null when loading a non-existent frame', async () => {
    const frame = await loadFrame('fake-id', 99);
    expect(frame).toBeUndefined();
  });

  it('returns 0 for frame count of non-existent flipbook', async () => {
    const count = await getFrameCount('fake-id');
    expect(count).toBe(0);
  });

  it('gracefully handles deletion of non-existent frame', async () => {
    await expect(deleteFrame('fake-id', 0)).resolves.not.toThrow();
  });

  it('handles duplication on empty flipbook', async () => {
    await expect(duplicateFrame('fake-id', 0)).resolves.not.toThrow();
  });
});
