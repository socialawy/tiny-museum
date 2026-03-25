'use client';

import { useState, useRef } from 'react';
import type { Room } from '@/lib/storage/db';
import { CreateRoomDialog } from './CreateRoomDialog';
import { ParentGate } from '@/components/ui/ParentGate';
import { FriendlyDialog } from '@/components/ui/FriendlyDialog';
import { renameRoom, deleteRoom } from '@/lib/storage/rooms';
import { useSounds } from '@/hooks/useSounds';

const DEFAULT_ROOM_IDS = ['my-art', 'favorites'];
const LONG_PRESS_MS = 500;

type Action = 'none' | 'choose' | 'rename' | 'delete-confirm';

interface RoomSelectorProps {
  rooms: Room[];
  activeRoomId: string;
  onSelect: (roomId: string) => void;
  onRoomCreated: () => void;
  onRoomRenamed: () => void;
  onRoomDeleted?: () => void;
}

export function RoomSelector({
  rooms,
  activeRoomId,
  onSelect,
  onRoomCreated,
  onRoomRenamed,
  onRoomDeleted,
}: RoomSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [gateForRoomId, setGateForRoomId] = useState<string | null>(null);
  const [actionRoomId, setActionRoomId] = useState<string | null>(null);
  const [action, setAction] = useState<Action>('none');
  const [editValue, setEditValue] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
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
    // Show action chooser after parent gate
    setActionRoomId(gateForRoomId);
    setAction('choose');
    setGateForRoomId(null);
  }

  function startRename() {
    const room = rooms.find((r) => r.id === actionRoomId);
    if (!room) return;
    setEditValue(room.name);
    setEditingRoomId(actionRoomId);
    setAction('none');
    setActionRoomId(null);
  }

  function startDelete() {
    setAction('delete-confirm');
  }

  async function handleDeleteFinal() {
    if (!actionRoomId) return;
    const wasActive = activeRoomId === actionRoomId;
    try {
      await deleteRoom(actionRoomId);
      playSound('delete');
      if (wasActive) onSelect('my-art');
      onRoomDeleted?.();
    } catch (err) {
      console.error('Delete room failed:', err);
    }
    setAction('none');
    setActionRoomId(null);
  }

  async function handleRenameConfirm(roomId: string) {
    const trimmed = editValue.trim();
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
                  ${activeRoomId === room.id
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
          message="A grown-up needs to confirm this action."
          onUnlock={handleGateUnlock}
          onCancel={() => setGateForRoomId(null)}
        />
      )}

      {/* Action chooser — rename or delete */}
      {action === 'choose' && actionRoomId && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => { setAction('none'); setActionRoomId(null); }}
        >
          <div
            className="bg-white rounded-kid p-6 max-w-xs w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-4xl mb-3">🏠</p>
            <h2 className="text-lg font-extrabold mb-1">
              {rooms.find((r) => r.id === actionRoomId)?.name}
            </h2>
            <p className="text-gray-400 text-sm mb-5">What would you like to do?</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={startRename}
                className="px-5 py-3 bg-kid-purple text-white rounded-kid font-bold
                           active:scale-95 transition-transform min-h-[48px]"
              >
                ✏️ Rename
              </button>
              <button
                onClick={startDelete}
                className="px-5 py-3 bg-kid-red text-white rounded-kid font-bold
                           active:scale-95 transition-transform min-h-[48px]"
              >
                🗑️ Delete Room
              </button>
              <button
                onClick={() => { setAction('none'); setActionRoomId(null); }}
                className="px-5 py-3 bg-gray-100 rounded-kid font-bold text-gray-500
                           active:scale-95 transition-transform min-h-[48px]"
              >
                Never mind 💚
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {action === 'delete-confirm' && actionRoomId && (
        <FriendlyDialog
          emoji="🏠"
          title="Delete this room?"
          message="All artwork inside will move to My Art. The room will be gone!"
          confirmLabel="Delete room"
          confirmEmoji="🗑️"
          cancelLabel="Keep it"
          danger
          onConfirm={handleDeleteFinal}
          onCancel={() => { setAction('none'); setActionRoomId(null); }}
        />
      )}
    </>
  );
}