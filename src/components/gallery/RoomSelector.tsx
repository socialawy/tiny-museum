'use client';

import type { Room } from '@/lib/storage/db';

interface RoomSelectorProps {
  rooms: Room[];
  activeRoomId: string;
  onSelect: (roomId: string) => void;
}

export function RoomSelector({ rooms, activeRoomId, onSelect }: RoomSelectorProps) {
  return (
    <div
      className="flex gap-2 px-4 py-3 overflow-x-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onSelect(room.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full
            font-bold text-sm whitespace-nowrap
            transition-all duration-150
            ${
              activeRoomId === room.id
                ? 'bg-museum-plaque text-white scale-105 shadow-lg'
                : 'bg-white text-gray-600 border-2 border-gray-200'
            }
          `}
          style={{
            minHeight: 44, // touch target
          }}
        >
          <span>{room.icon}</span>
          <span>{room.name}</span>
        </button>
      ))}
    </div>
  );
}
