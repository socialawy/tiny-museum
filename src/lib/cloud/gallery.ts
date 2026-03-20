import { supabase } from './client';
import type { PublishedArtwork } from './types';

export async function fetchPublishedArtworks(): Promise<PublishedArtwork[]> {
  const { data, error } = await supabase
    .from('published_artworks')
    .select('id, title, type, image_url, room_name, published_at, updated_at')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
