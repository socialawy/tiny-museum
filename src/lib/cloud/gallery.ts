import { supabase } from './client';
import type { PublishedArtwork } from './types';

export async function fetchPublishedArtworks(): Promise<PublishedArtwork[]> {
  const { data, error } = await supabase
    .from('published_artworks')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
