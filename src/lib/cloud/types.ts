export interface PublishedArtwork {
  id: string;
  title: string;
  type: 'drawing' | 'collage' | 'flipbook';
  image_url: string;
  room_name: string | null;
  published_at: string;
  updated_at: string;
}
