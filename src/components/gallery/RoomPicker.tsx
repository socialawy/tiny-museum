'use client';

import { useEffect, useState } from 'react';
import { listRooms } from '@/lib/storage/rooms';
import { moveArtwork } from '@/lib/storage/artworks';
import type { Room } from '@/lib/storage/db';
import { useSounds } from '@/hooks/useSounds';

interface RoomPickerProps {
  artworkId: string;
  currentRoomId: string;
  onMoved: (newRoomId: string) => void;
  onClose: () => void;
}

export function RoomPicker({
  artworkId,
  currentRoomId,
  onMoved,
  onClose,
}: RoomPickerProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { playSound } = useSounds();

  useEffect(() => {
    listRooms().then(setRooms);
  }, []);

  async function handlePick(roomId: string) {
    if (roomId === currentRoomId) {
      onClose();
      return;
    }
    await moveArtwork(artworkId, roomId);
    playSound('roomSwitch');
    onMoved(roomId);
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-kid w-full max-w-md p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold">📂 Move to Room</h3>
          <button onClick={onClose} className="kid-button text-sm">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handlePick(room.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-kid text-left
                font-bold transition-all active:scale-[0.98]
                ${
                  room.id === currentRoomId
                    ? 'bg-kid-purple/10 border-2 border-kid-purple'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                }
              `}
            >
              <span className="text-2xl">{room.icon}</span>
              <span className="flex-1">{room.name}</span>
              {room.id === currentRoomId && (
                <span className="text-xs text-kid-purple font-bold">Current</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
