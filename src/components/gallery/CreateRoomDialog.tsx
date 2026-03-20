'use client';

import { useState } from 'react';
import { createRoom } from '@/lib/storage/rooms';
import { BigButton } from '@/components/ui/BigButton';

interface CreateRoomDialogProps {
  onCreated: () => void;
  onCancel: () => void;
}

const ROOM_ICONS = [
  '🎨',
  '🌊',
  '🌺',
  '🦄',
  '🚀',
  '🏰',
  '🌈',
  '👨‍👩‍👧',
  '🐾',
  '🎵',
  '📚',
  '⚽',
];
const ROOM_COLORS = [
  '#6C5CE7',
  '#00B894',
  '#FF6B6B',
  '#48DBFB',
  '#FECA57',
  '#FD79A8',
  '#E17055',
  '#A29BFE',
];

export function CreateRoomDialog({ onCreated, onCancel }: CreateRoomDialogProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎨');
  const [color, setColor] = useState('#6C5CE7');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim() || saving) return;
    setSaving(true);
    await createRoom(name.trim(), icon, color);
    onCreated();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-kid p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-extrabold mb-4">🏛️ New Room</h2>

        {/* Room name */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Room name..."
          autoFocus
          maxLength={24}
          className="w-full text-lg font-bold px-4 py-3 rounded-kid
                     border-2 border-gray-200 outline-none
                     focus:border-kid-purple transition-colors mb-4"
        />

        {/* Icon picker */}
        <p className="text-sm font-bold text-gray-500 mb-2">Pick an icon:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {ROOM_ICONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setIcon(emoji)}
              className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center
                transition-all ${
                  icon === emoji
                    ? 'bg-kid-purple text-white scale-110 shadow-md'
                    : 'bg-gray-100'
                }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <p className="text-sm font-bold text-gray-500 mb-2">Pick a color:</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {ROOM_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition-transform"
              style={{
                backgroundColor: c,
                border: color === c ? '3px solid #2D3436' : '2px solid #E0E0E0',
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Preview */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full mb-5 mx-auto w-fit"
          style={{ backgroundColor: color }}
        >
          <span>{icon}</span>
          <span className="font-bold text-white text-sm">{name || 'Room Name'}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 rounded-kid font-bold
                       active:scale-95 transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-5 py-2 bg-kid-purple text-white rounded-kid font-bold
                       active:scale-95 transition-transform disabled:opacity-40"
          >
            Create ✨
          </button>
        </div>
      </div>
    </div>
  );
}
