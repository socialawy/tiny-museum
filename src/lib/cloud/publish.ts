import type { Artwork } from '@/lib/storage/db';
import { supabase } from './client';

export async function publishArtwork(artwork: Artwork, imageBlob: Blob): Promise<string> {
  const filename = `${artwork.id}.png`;

  // 1. Upload image file
  const { error: uploadError } = await supabase.storage
    .from('artwork-files')
    .upload(filename, imageBlob, { upsert: true, contentType: 'image/png' });

  if (uploadError) throw uploadError;

  // 2. Get public URL (sync — no network call)
  const { data: urlData } = supabase.storage.from('artwork-files').getPublicUrl(filename);

  const imageUrl = urlData.publicUrl;

  // 3. Write metadata row
  const { error: dbError } = await supabase.from('published_artworks').upsert({
    id: artwork.id,
    title: artwork.title,
    type: artwork.type,
    image_url: imageUrl,
    room_name: artwork.roomId,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (dbError) throw dbError;

  return imageUrl;
}

export async function unpublishArtwork(id: string): Promise<void> {
  const { error: dbError } = await supabase
    .from('published_artworks')
    .delete()
    .eq('id', id);

  if (dbError) throw dbError;

  // Best-effort file removal — don't throw if this fails
  await supabase.storage.from('artwork-files').remove([`${id}.png`]);
}
