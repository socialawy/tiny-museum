import { nanoid } from 'nanoid';
import { db, type Artwork, type FlipbookFrame } from './db';
import { funFlipbookName } from '@/lib/names';

// ── Frame Management ──

export async function saveFrame(
  artworkId: string,
  index: number,
  canvasJSON: string,
  thumbnailBlob: Blob,
): Promise<FlipbookFrame> {
  const id = `${artworkId}_frame_${index}`;
  const frame: FlipbookFrame = {
    id,
    artworkId,
    index,
    canvasJSON,
    thumbnail: thumbnailBlob,
  };
  await db.frames.put(frame);
  return frame;
}

export async function loadFrame(
  artworkId: string,
  index: number,
): Promise<FlipbookFrame | undefined> {
  return db.frames.get(`${artworkId}_frame_${index}`);
}

export async function loadAllFrames(artworkId: string): Promise<FlipbookFrame[]> {
  return db.frames.where('artworkId').equals(artworkId).sortBy('index');
}

export async function getFrameCount(artworkId: string): Promise<number> {
  return db.frames.where('artworkId').equals(artworkId).count();
}

export async function deleteFrame(artworkId: string, index: number): Promise<void> {
  await db.frames.delete(`${artworkId}_frame_${index}`);
  // Re-index remaining frames
  const remaining = await loadAllFrames(artworkId);
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].index !== i) {
      const oldId = remaining[i].id;
      const newFrame = { ...remaining[i], index: i, id: `${artworkId}_frame_${i}` };
      await db.frames.delete(oldId);
      await db.frames.put(newFrame);
    }
  }
}

export async function duplicateFrame(
  artworkId: string,
  sourceIndex: number,
): Promise<void> {
  const frames = await loadAllFrames(artworkId);
  const source = frames.find((f) => f.index === sourceIndex);
  if (!source) return;

  // Shift frames after the source up by one
  for (let i = frames.length - 1; i > sourceIndex; i--) {
    const f = frames[i];
    const newId = `${artworkId}_frame_${f.index + 1}`;
    await db.frames.delete(f.id);
    await db.frames.put({ ...f, index: f.index + 1, id: newId });
  }

  // Insert duplicate
  await saveFrame(artworkId, sourceIndex + 1, source.canvasJSON, source.thumbnail);
}

// ── Flipbook CRUD ──

export async function createFlipbook(title?: string): Promise<Artwork> {
  const id = nanoid(12);
  const now = Date.now();

  const artwork: Artwork = {
    id,
    title: title ?? funFlipbookName(),
    roomId: 'my-art',
    type: 'flipbook',
    thumbnail: new Blob([], { type: 'image/webp' }),
    canvasJSON: JSON.stringify({ fps: 4, frameCount: 1 }),
    createdAt: now,
    updatedAt: now,
    tags: [],
  };

  // Create first empty frame
  const emptyCanvas = JSON.stringify({
    version: '6.0.0',
    objects: [],
    background: '#FFFEF7',
  });

  await db.transaction('rw', db.artworks, db.frames, async () => {
    await db.artworks.put(artwork);
    await db.frames.put({
      id: `${id}_frame_0`,
      artworkId: id,
      index: 0,
      canvasJSON: emptyCanvas,
      thumbnail: new Blob([], { type: 'image/webp' }),
    });
  });

  return artwork;
}

export async function updateFlipbookMeta(
  id: string,
  fps: number,
  thumbnail: Blob,
  width?: number,
  height?: number,
): Promise<void> {
  const frameCount = await getFrameCount(id);
  const meta: Record<string, unknown> = { fps, frameCount };
  if (width) meta.width = width;
  if (height) meta.height = height;
  await db.artworks.update(id, {
    canvasJSON: JSON.stringify(meta),
    thumbnail,
    updatedAt: Date.now(),
  });
}

export async function deleteFlipbook(id: string): Promise<void> {
  await db.transaction('rw', db.artworks, db.blobs, db.frames, async () => {
    await db.frames.where('artworkId').equals(id).delete();
    await db.blobs.delete(id);
    await db.artworks.delete(id);
  });
}
