import { nanoid } from 'nanoid';
import { db, type Room } from './db';

export async function listRooms(): Promise<Room[]> {
  return db.rooms.orderBy('order').toArray();
}

export async function createRoom(
  name: string,
  icon: string,
  color: string,
): Promise<Room> {
  const existing = await db.rooms.count();
  const room: Room = {
    id: nanoid(8),
    name,
    icon,
    color,
    order: existing,
    createdAt: Date.now(),
  };
  await db.rooms.add(room);
  return room;
}

export async function deleteRoom(id: string) {
  // Move artworks to default room first
  await db.artworks.where('roomId').equals(id).modify({ roomId: 'my-art' });
  await db.rooms.delete(id);
}
