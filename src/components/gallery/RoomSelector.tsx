'use client';

import { useState, useRef } from 'react';
import type { Room } from '@/lib/storage/db';
import { CreateRoomDialog } from './CreateRoomDialog';
import { ParentGate } from '@/components/ui/ParentGate';
import { renameRoom } from '@/lib/storage/rooms';
import { useSounds } from '@/hooks/useSounds';

const DEFAULT_ROOM_IDS = ['my-art', 'favorites'];
const LONG_PRESS_MS = 500;

interface RoomSelectorProps {
  rooms: Room[];
  activeRoomId: string;
  onSelect: (roomId: string) => void;
  onRoomCreated: () => void;
  onRoomRenamed: () => void;
}

export function RoomSelector({
  rooms,
  activeRoomId,
  onSelect,
  onRoomCreated,
  onRoomRenamed,
}: RoomSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [gateForRoomId, setGateForRoomId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPressFor = useRef<string | null>(null);
  const { playSound } = useSounds();

  function handlePointerDown(room: Room) {
    if (DEFAULT_ROOM_IDS.includes(room.id)) return;
    pressTimer.current = setTimeout(() => {
      wasLongPressFor.current = room.id;
      setGateForRoomId(room.id);
      pressTimer.current = null;
    }, LONG_PRESS_MS);
  }

  function handlePointerUp() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  function handleGateUnlock() {
    const room = rooms.find((r) => r.id === gateForRoomId);
    if (!room) return;
    setEditValue(room.name);
    setEditingRoomId(gateForRoomId);
    setGateForRoomId(null);
  }

  async function handleRenameConfirm(roomId: string) {
    const trimmed = editValue.trim();
    // Clear state immediately (before await) — prevents double-call issues
    setEditingRoomId(null);
    setEditValue('');
    if (trimmed) {
      try {
        await renameRoom(roomId, trimmed);
        onRoomRenamed();
      } catch (err) {
        console.error('Rename failed:', err);
      }
    }
  }

  function handleRenameCancel() {
    setEditingRoomId(null);
    setEditValue('');
  }

  return (
    <>
      <div
        className="flex gap-2 px-4 py-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {rooms.map((room) => (
          <div key={room.id} className="flex-shrink-0">
            {editingRoomId === room.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
                onBlur={() => handleRenameCancel()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameConfirm(room.id);
                  if (e.key === 'Escape') handleRenameCancel();
                }}
                className="px-4 py-2 rounded-full font-bold text-sm border-2 border-kid-purple outline-none"
                style={{ minWidth: 80 }}
              />
            ) : (
              <button
                onClick={() => {
                  if (wasLongPressFor.current === room.id) {
                    wasLongPressFor.current = null;
                    return;
                  }
                  onSelect(room.id);
                  playSound('roomSwitch');
                }}
                onPointerDown={() => handlePointerDown(room)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
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
                style={
                  activeRoomId === room.id ? { backgroundColor: room.color } : undefined
                }
              >
                <span>{room.icon}</span>
                <span>{room.name}</span>
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-full
                     bg-gray-100 text-gray-400 font-bold text-sm
                     whitespace-nowrap active:scale-95 transition-transform flex-shrink-0"
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

      {gateForRoomId && (
        <ParentGate
          message="A grown-up needs to confirm renaming this room."
          onUnlock={handleGateUnlock}
          onCancel={() => setGateForRoomId(null)}
        />
      )}
    </>
  );
}
