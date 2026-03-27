import { db } from './db';

/**
 * Converts a Blob to a base64 string for JSON export.
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (blob.size === 0) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts a base64 string back to a Blob for import.
 */
function base64ToBlob(base64: string): Blob {
  if (!base64) return new Blob([], { type: 'image/webp' });
  const [header, data] = base64.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

/**
 * Exports the entire Dexie database as a JSON string.
 */
export async function exportMuseum(): Promise<string> {
  const artworks = await db.artworks.toArray();
  const blobs = await db.blobs.toArray();
  const frames = await db.frames.toArray();
  const rooms = await db.rooms.toArray();
  const settings = await db.settings.toArray();

  const backup = {
    appName: 'TinyMuseum',
    version: 1,
    timestamp: Date.now(),
    artworks: await Promise.all(
      artworks.map(async (a) => ({
        ...a,
        thumbnail: await blobToBase64(a.thumbnail),
      })),
    ),
    blobs: await Promise.all(
      blobs.map(async (b) => ({
        ...b,
        fullRes: await blobToBase64(b.fullRes),
      })),
    ),
    frames: await Promise.all(
      frames.map(async (f) => ({
        ...f,
        thumbnail: await blobToBase64(f.thumbnail),
      })),
    ),
    rooms,
    settings,
  };

  return JSON.stringify(backup);
}

/**
 * Clears current database and imports data from a JSON string.
 */
export async function importMuseum(jsonStr: string): Promise<void> {
  const backup = JSON.parse(jsonStr);
  if (backup.appName !== 'TinyMuseum') {
    throw new Error('Invalid backup file: Not a Tiny Museum museum.');
  }

  await db.transaction(
    'rw',
    [db.artworks, db.blobs, db.frames, db.rooms, db.settings],
    async () => {
      // Clear all existing data
      await db.artworks.clear();
      await db.blobs.clear();
      await db.frames.clear();
      await db.rooms.clear();
      await db.settings.clear();

      // Restore data with Blob conversion
      for (const a of backup.artworks) {
        await db.artworks.add({
          ...a,
          thumbnail: base64ToBlob(a.thumbnail),
        });
      }
      for (const b of backup.blobs) {
        await db.blobs.add({
          ...b,
          fullRes: base64ToBlob(b.fullRes),
        });
      }
      for (const f of backup.frames) {
        await db.frames.add({
          ...f,
          thumbnail: base64ToBlob(f.thumbnail),
        });
      }
      for (const r of backup.rooms) {
        await db.rooms.add(r);
      }
      for (const s of backup.settings) {
        await db.settings.add(s);
      }
    },
  );
}
