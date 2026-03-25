'use client';

import { useState, useEffect } from 'react';
import { ParentGate } from '@/components/ui/ParentGate';

interface PinGateProps {
  onUnlock: () => void;
  onCancel: () => void;
}

export function PinGate({ onUnlock, onCancel }: PinGateProps) {
  const [pin, setPin] = useState('');
  const [expectedPin, setExpectedPin] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);

  useEffect(() => {
    const storedPin = localStorage.getItem('tiny_museum_pin');
    if (storedPin) {
      setExpectedPin(storedPin);
    } else {
      // If no PIN is set, unlock immediately
      onUnlock();
    }
  }, [onUnlock]);

  useEffect(() => {
    if (pin.length === 4 && expectedPin) {
      if (pin === expectedPin) {
        onUnlock();
      } else {
        setWrong(true);
        setTimeout(() => {
          setPin('');
          setWrong(false);
        }, 500);
      }
    }
  }, [pin, expectedPin, onUnlock]);

  if (!expectedPin) {
    return null; // Unlock will be called by useEffect
  }

  if (showParentGate) {
    return (
      <ParentGate
        onUnlock={() => {
          setShowParentGate(false);
          onUnlock(); // Parent gate bypassed the PIN
        }}
        onCancel={() => setShowParentGate(false)}
        message="Solve this to bypass the PIN and enter the Studio."
      />
    );
  }

  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  // 1-9 then delete, 0, forgot
  const padLayout = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center px-6 bg-museum-canvas">
      <div
        className={`bg-white rounded-kid p-8 max-w-sm w-full text-center shadow-2xl border-4 border-museum-frame ${wrong ? 'animate-shake' : ''}`}
      >
        <h2 className="text-3xl font-extrabold mb-2 text-kid-purple">Studio Locked</h2>
        <p className="text-gray-500 mb-6 text-base font-semibold">
          Enter PIN to create art! 🎨
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-4 mb-8" data-testid="pin-dots">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              data-testid={`pin-dot-${i}`}
              className={`w-6 h-6 rounded-full border-4 transition-colors ${
                i < pin.length
                  ? 'bg-kid-purple border-kid-purple'
                  : 'bg-transparent border-gray-300'
              } ${wrong ? 'border-kid-red bg-kid-red' : ''}`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {padLayout.map((row) =>
            row.map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="h-16 bg-gray-100 rounded-xl text-3xl font-extrabold text-gray-800 active:scale-95 active:bg-gray-200 transition-all flex items-center justify-center shadow-sm"
              >
                {num}
              </button>
            )),
          )}
          {/* Bottom row */}
          <button
            onClick={handleDelete}
            className="h-16 bg-red-100 rounded-xl text-xl font-bold text-red-600 active:scale-95 active:bg-red-200 transition-all flex items-center justify-center shadow-sm"
          >
            DEL
          </button>
          <button
            onClick={() => handleNumberClick(0)}
            className="h-16 bg-gray-100 rounded-xl text-3xl font-extrabold text-gray-800 active:scale-95 active:bg-gray-200 transition-all flex items-center justify-center shadow-sm"
          >
            0
          </button>
          <button
            onClick={onCancel}
            className="h-16 bg-gray-200 rounded-xl text-xl font-bold text-gray-700 active:scale-95 active:bg-gray-300 transition-all flex items-center justify-center shadow-sm"
          >
            Back
          </button>
        </div>

        <button
          onClick={() => setShowParentGate(true)}
          className="text-kid-purple font-bold text-lg hover:underline underline-offset-4"
        >
          Forgot PIN? 🤔
        </button>
      </div>
    </div>
  );
}
