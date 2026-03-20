import { nanoid } from 'nanoid';
import { db, type Artwork, type ArtworkBlob } from './db';

// ── Helpers ──

function dataURLtoBlob(dataUrl: string): Blob {
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
    maxSize: number = 400
): Promise<Blob> {
    return new Promise((resolve) => {
        const scale = maxSize / Math.max(canvas.width, canvas.height);
        const thumb = document.createElement('canvas');
        thumb.width = Math.round(canvas.width * scale);
        thumb.height = Math.round(canvas.height * scale);

        const ctx = thumb.getContext('2d')!;
        ctx.drawImage(canvas, 0, 0, thumb.width, thumb.height);

        thumb.toBlob(
            (blob) => resolve(blob!),
            'image/webp',
            0.8
        );
    });
}

// ── CRUD ──

export async function saveArtwork(
    fabricCanvas: any,          // Fabric Canvas instance
    existingId?: string
): Promise<Artwork> {
    const id = existingId ?? nanoid(12);
    const now = Date.now();

    // Serialize Fabric state
    const canvasJSON = JSON.stringify(fabricCanvas.toJSON());

    // Generate full-res PNG
    const fullDataUrl = fabricCanvas.toDataURL({
        format: 'png',
        multiplier: 2,
    });
    const fullBlob = dataURLtoBlob(fullDataUrl);

    // Generate thumbnail
    const canvasEl = fabricCanvas.getElement() as HTMLCanvasElement;
    const thumbnail = await generateThumbnail(canvasEl);

    // Build artwork record
    const artwork: Artwork = {
        id,
        title: `Masterpiece #${Math.floor(Math.random() * 999) + 1}`,
        roomId: 'my-art',
        type: 'drawing',
        thumbnail,
        canvasJSON,
        createdAt: existingId
            ? (await db.artworks.get(id))?.createdAt ?? now
            : now,
        updatedAt: now,
        tags: [],
    };

    const blob: ArtworkBlob = {
        id,
        fullRes: fullBlob,
        format: 'png',
    };

    // Upsert both in a transaction
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
    return db.artworks
        .where('roomId')
        .equals(roomId)
        .reverse()
        .sortBy('createdAt');
}

export async function listAllArtworks() {
    return db.artworks
        .orderBy('createdAt')
        .reverse()
        .toArray();
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