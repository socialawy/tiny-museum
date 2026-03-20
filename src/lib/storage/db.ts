import Dexie, { type Table } from 'dexie';

export interface Artwork {
    id: string;
    title: string;
    roomId: string;
    type: 'drawing' | 'collage' | 'flipbook';
    thumbnail: Blob;          // compressed 400px preview
    canvasJSON: string;        // Fabric.js serialized state
    createdAt: number;
    updatedAt: number;
    tags: string[];
}

export interface ArtworkBlob {
    id: string;                // matches artwork.id
    fullRes: Blob;             // full resolution PNG
    format: 'png' | 'svg';
}

export interface Room {
    id: string;
    name: string;
    icon: string;              // emoji
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

        // Seed default room on first open
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