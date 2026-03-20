import Dexie, { type Table } from 'dexie';

export interface Artwork {
  id: string;
  title: string;
  roomId: string;
  type: 'drawing' | 'collage' | 'flipbook';
  thumbnail: Blob;
  canvasJSON: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  publishedUrl?: string; // set when artwork is published to Supabase
}

export interface ArtworkBlob {
  id: string;
  fullRes: Blob;
  format: 'png' | 'svg' | 'gif';
}

export interface FlipbookFrame {
  id: string; // artworkId + '_frame_' + index
  artworkId: string; // parent flipbook
  index: number; // frame order
  canvasJSON: string; // Fabric.js state for this frame
  thumbnail: Blob; // small preview
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  createdAt: number;
}

export interface AppSettings {
  key: string;
  value: string | number | boolean;
}

class TinyMuseumDB extends Dexie {
  artworks!: Table<Artwork>;
  blobs!: Table<ArtworkBlob>;
  frames!: Table<FlipbookFrame>;
  rooms!: Table<Room>;
  settings!: Table<AppSettings>;

  constructor() {
    super('TinyMuseum');

    this.version(1).stores({
      artworks: 'id, roomId, type, createdAt, *tags',
      blobs: 'id',
      rooms: 'id, order',
      settings: 'key',
    });

    // Version 2: Add frames table for flipbooks
    this.version(2).stores({
      artworks: 'id, roomId, type, createdAt, *tags',
      blobs: 'id',
      frames: 'id, artworkId, index',
      rooms: 'id, order',
      settings: 'key',
    });

    this.on('populate', (tx) => {
      tx.table('rooms').add({
        id: 'my-art',
        name: 'My Art',
        icon: '🎨',
        color: '#6C5CE7',
        order: 0,
        createdAt: Date.now(),
      });
      tx.table('rooms').add({
        id: 'favorites',
        name: 'Favorites',
        icon: '⭐',
        color: '#FECA57',
        order: 1,
        createdAt: Date.now(),
      });
    });
  }
}

export const db = new TinyMuseumDB();
