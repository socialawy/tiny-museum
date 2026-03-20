import { db } from './db';

/**
 * Cleans expired blob:// URLs from all artwork canvas JSON.
 * Runs on every gallery load — fast (string.includes check per artwork).
 * Only writes to DB if an artwork actually has blob references.
 */
export async function cleanExpiredBlobUrls(): Promise<number> {
  const allArtworks = await db.artworks.toArray();
  let patched = 0;

  for (const artwork of allArtworks) {
    if (artwork.canvasJSON.includes('blob:')) {
      // Replace ALL blob: URLs in the JSON, not just "src" fields
      const cleaned = artwork.canvasJSON.replace(/blob:http[s]?:\/\/[^"']*/g, '');

      if (cleaned !== artwork.canvasJSON) {
        await db.artworks.update(artwork.id, {
          canvasJSON: cleaned,
          updatedAt: Date.now(),
        });
        patched++;
      }
    }
  }

  if (patched > 0) {
    console.log(`🧹 Cleaned blob URLs from ${patched} artwork(s)`);
  }

  return patched;
}
