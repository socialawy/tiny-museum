'use client';

import { BigButton } from './BigButton';

interface FriendlyDialogProps {
  emoji: string;
  title: string;
  message: string;
  confirmLabel: string;
  confirmEmoji?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FriendlyDialog({
  emoji,
  title,
  message,
  confirmLabel,
  confirmEmoji = '✓',
  cancelLabel = 'Go back',
  danger = false,
  onConfirm,
  onCancel,
}: FriendlyDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-kid p-6 max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-label={title}
      >
        <p className="text-5xl mb-3">{emoji}</p>
        <h2 className="text-xl font-extrabold mb-2">{title}</h2>
        <p className="text-gray-500 mb-6 text-base">{message}</p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-3 bg-gray-100 rounded-kid font-bold text-base
                       active:scale-95 transition-transform min-h-[48px]"
          >
            {cancelLabel} 💚
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-3 rounded-kid font-bold text-base text-white
                       active:scale-95 transition-transform min-h-[48px]
                       ${danger ? 'bg-kid-red' : 'bg-kid-purple'}`}
          >
            {confirmLabel} {confirmEmoji}
          </button>
        </div>
      </div>
    </div>
  );
}
