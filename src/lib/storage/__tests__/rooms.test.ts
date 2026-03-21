import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { listRooms, createRoom, deleteRoom, renameRoom } from '../rooms';

describe('Room CRUD', () => {
  beforeEach(async () => {
    await db.rooms.clear();
    await db.artworks.clear();

    await db.rooms.bulkAdd([
      {
        id: 'my-art',
        name: 'My Art',
        icon: '🎨',
        color: '#6C5CE7',
        order: 0,
        createdAt: Date.now(),
      },
      {
        id: 'favorites',
        name: 'Favorites',
        icon: '⭐',
        color: '#FECA57',
        order: 1,
        createdAt: Date.now(),
      },
    ]);
  });

  it('lists default rooms in order', async () => {
    const rooms = await listRooms();
    expect(rooms.length).toBe(2);
    expect(rooms[0].id).toBe('my-art');
    expect(rooms[1].id).toBe('favorites');
  });

  it('creates a new room with correct order', async () => {
    const room = await createRoom('Ocean World', '🌊', '#48DBFB');
    expect(room.id).toBeDefined();
    expect(room.name).toBe('Ocean World');
    expect(room.order).toBe(2);

    const all = await listRooms();
    expect(all.length).toBe(3);
  });

  it('moves orphaned artworks to my-art on room delete', async () => {
    const room = await createRoom('Temp', '🔥', '#FF0000');

    await db.artworks.add({
      id: 'orphan-art',
      title: 'Orphan',
      roomId: room.id,
      type: 'drawing',
      thumbnail: new Blob(['test']),
      canvasJSON: '{}',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
    });

    await deleteRoom(room.id);

    const rooms = await listRooms();
    expect(rooms.find((r) => r.id === room.id)).toBeUndefined();

    const artwork = await db.artworks.get('orphan-art');
    expect(artwork!.roomId).toBe('my-art');
  });

  it('renames a custom room', async () => {
    const room = await createRoom('Old Name', '🌊', '#48DBFB');
    await renameRoom(room.id, 'New Name');
    const all = await listRooms();
    const updated = all.find((r) => r.id === room.id);
    expect(updated?.name).toBe('New Name');
  });

  it('silently ignores rename of default rooms', async () => {
    await renameRoom('my-art', 'Hacked');
    await renameRoom('favorites', 'Hacked');
    const rooms = await listRooms();
    expect(rooms.find((r) => r.id === 'my-art')?.name).toBe('My Art');
    expect(rooms.find((r) => r.id === 'favorites')?.name).toBe('Favorites');
  });
});
