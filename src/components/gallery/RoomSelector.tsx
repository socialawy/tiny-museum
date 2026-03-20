'use client';

import { useState } from 'react';
import type { Room } from '@/lib/storage/db';
import { CreateRoomDialog } from './CreateRoomDialog';

interface RoomSelectorProps {
  rooms: Room[];
  activeRoomId: string;
  onSelect: (roomId: string) => void;
  onRoomCreated: () => void;
}

export function RoomSelector({
  rooms,
  activeRoomId,
  onSelect,
  onRoomCreated,
}: RoomSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <div
        className="flex gap-2 px-4 py-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onSelect(room.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full
              font-bold text-sm whitespace-nowrap
              transition-all duration-150
              ${
                activeRoomId === room.id
                  ? 'text-white shadow-md scale-105'
                  : 'bg-white text-gray-600 border-2 border-gray-200 active:scale-95'
              }
            `}
            style={activeRoomId === room.id ? { backgroundColor: room.color } : undefined}
          >
            <span>{room.icon}</span>
            <span>{room.name}</span>
          </button>
        ))}

        {/* Add room button */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-full
                     bg-gray-100 text-gray-400 font-bold text-sm
                     whitespace-nowrap active:scale-95 transition-transform"
          style={{ minHeight: 36 }}
        >
          <span>＋</span>
          <span>New Room</span>
        </button>
      </div>

      {showCreate && (
        <CreateRoomDialog
          onCreated={() => {
            setShowCreate(false);
            onRoomCreated();
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </>
  );
}
