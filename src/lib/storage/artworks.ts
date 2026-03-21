/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from 'nanoid';
import { db, type Artwork, type ArtworkBlob } from './db';

// ── Helpers ──

export function dataURLtoBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function generateThumbnail(
  canvas: HTMLCanvasElement,
  maxSize: number = 400,
): Promise<Blob> {
  return new Promise((resolve) => {
    const scale = maxSize / Math.max(canvas.width, canvas.height, 1);
    const thumb = document.createElement('canvas');
    thumb.width = Math.round(canvas.width * scale) || 1;
    thumb.height = Math.round(canvas.height * scale) || 1;

    const ctx = thumb.getContext('2d')!;
    ctx.drawImage(canvas, 0, 0, thumb.width, thumb.height);

    thumb.toBlob(
      (blob) => resolve(blob ?? new Blob([], { type: 'image/webp' })),
      'image/webp',
      0.8,
    );
  });
}

/**
 * Before serialization: walk all Fabric objects and convert
 * any blob: image sources to data URLs using the live element.
 */
function convertBlobSourcesToDataUrl(fabricCanvas: Record<string, unknown>): void {
  try {
    const getObjectsFn = fabricCanvas.getObjects as (() => any[]) | undefined;
    const objects = (getObjectsFn?.call(fabricCanvas) ?? []) as any[];
    for (const obj of objects) {
      const objRecord = obj as Record<string, unknown>;
      if (objRecord.type !== 'image') continue;

      // Get the underlying image element
      const el = objRecord._element as HTMLImageElement | HTMLCanvasElement | null;
      if (!el) continue;

      // Check if source is a blob URL
      const src =
        (el as HTMLImageElement).src ??
        (objRecord._originalElement as Record<string, unknown> | null)?.src ??
        '';

      if (!src.startsWith('blob:')) continue;

      // Convert to data URL via temp canvas
      try {
        const w =
          (el as HTMLImageElement).naturalWidth || (el as HTMLCanvasElement).width || 100;
        const h =
          (el as HTMLImageElement).naturalHeight ||
          (el as HTMLCanvasElement).height ||
          100;

        const tmp = document.createElement('canvas');
        tmp.width = w;
        tmp.height = h;
        const ctx = tmp.getContext('2d');
        if (ctx) {
          ctx.drawImage(el, 0, 0);
          const dataUrl = tmp.toDataURL('image/png');
          // Update the element source
          if ((el as HTMLImageElement).src) {
            (el as HTMLImageElement).src = dataUrl;
          }
        }
      } catch {
        // If conversion fails, we'll catch it in the string replacement below
      }
    }
  } catch {
    // Fail silently — the string replacement fallback will catch remaining blobs
  }
}

/**
 * Final safety net: replace any blob: URLs in the serialized JSON string.
 * Images with removed blob sources will appear empty but the artwork
 * structure (shapes, drawings, positions) is preserved.
 */
function sanitizeBlobUrls(jsonString: string): string {
  return jsonString.replace(/"blob:http[^"]*"/g, '""');
}

// ── CRUD ──

export async function saveArtwork(
  fabricCanvas: Record<string, unknown>,
  existingId?: string,
): Promise<Artwork> {
  const id = existingId ?? nanoid(12);
  const now = Date.now();

  // Step 1: Convert blob sources on live objects BEFORE serialization
  convertBlobSourcesToDataUrl(fabricCanvas);

  // Step 2: Serialize
  const toJSONFn = fabricCanvas.toJSON as (() => any) | undefined;
  const canvasJson = toJSONFn?.call(fabricCanvas) ?? {};

  // Step 3: Nuclear sanitization — catch anything that slipped through
  const canvasJSON = sanitizeBlobUrls(JSON.stringify(canvasJson));

  // Generate exports
  const toDataURLFn = fabricCanvas.toDataURL as
    | ((options: Record<string, any>) => string)
    | undefined;
  const fullDataUrl =
    toDataURLFn?.call(fabricCanvas, {
      format: 'png',
      multiplier: 2,
    }) ?? '';
  const fullBlob = dataURLtoBlob(fullDataUrl);

  const getElementFn = fabricCanvas.getElement as (() => any) | undefined;
  const canvasEl = getElementFn?.call(fabricCanvas) as HTMLCanvasElement | undefined;
  if (!canvasEl) {
    throw new Error('Failed to get canvas element');
  }
  const thumbnail = await generateThumbnail(canvasEl);

  // Preserve existing metadata on update
  const existing = existingId ? await db.artworks.get(id) : null;

  const artwork: Artwork = {
    id,
    title: existing?.title ?? `Masterpiece #${Math.floor(Math.random() * 999) + 1}`,
    roomId: existing?.roomId ?? 'my-art',
    type: 'drawing',
    thumbnail,
    canvasJSON,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    tags: existing?.tags ?? [],
    ...(existing?.publishedUrl !== undefined && { publishedUrl: existing.publishedUrl }),
  };

  const blob: ArtworkBlob = {
    id,
    fullRes: fullBlob,
    format: 'png',
  };

  await db.transaction('rw', db.artworks, db.blobs, async () => {
    await db.artworks.put(artwork);
    await db.blobs.put(blob);
  });

  return artwork;
}

export async function loadArtwork(id: string) {
  return db.artworks.get(id);
}

export async function loadArtworkBlob(id: string) {
  return db.blobs.get(id);
}

export async function listArtworksByRoom(roomId: string) {
  return db.artworks.where('roomId').equals(roomId).reverse().sortBy('createdAt');
}

export async function listAllArtworks() {
  return db.artworks.orderBy('createdAt').reverse().toArray();
}

export async function deleteArtwork(id: string) {
  await db.transaction('rw', db.artworks, db.blobs, async () => {
    await db.artworks.delete(id);
    await db.blobs.delete(id);
  });
}

export async function moveArtwork(id: string, newRoomId: string) {
  await db.artworks.update(id, {
    roomId: newRoomId,
    updatedAt: Date.now(),
  });
}

export async function renameArtwork(id: string, title: string) {
  await db.artworks.update(id, {
    title,
    updatedAt: Date.now(),
  });
}

export async function toggleFavorite(id: string) {
  const artwork = await db.artworks.get(id);
  if (!artwork) return;

  const tags = artwork.tags.includes('favorite')
    ? artwork.tags.filter((t) => t !== 'favorite')
    : [...artwork.tags, 'favorite'];

  await db.artworks.update(id, { tags, updatedAt: Date.now() });
}

export async function updatePublishedUrl(
  id: string,
  publishedUrl: string | undefined,
): Promise<void> {
  if (publishedUrl === undefined) {
    await db.artworks
      .where('id')
      .equals(id)
      .modify((record) => {
        delete (record as any).publishedUrl;
      });
  } else {
    await db.artworks.update(id, { publishedUrl });
  }
}
