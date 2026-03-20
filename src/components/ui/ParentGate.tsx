'use client';

import { useState, useMemo } from 'react';

interface ParentGateProps {
  onUnlock: () => void;
  onCancel: () => void;
  message?: string;
}

export function ParentGate({ onUnlock, onCancel, message }: ParentGateProps) {
  const problem = useMemo(() => {
    const a = Math.floor(Math.random() * 8) + 3;
    const b = Math.floor(Math.random() * 8) + 3;
    return { a, b, answer: a * b };
  }, []);

  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  function check() {
    if (parseInt(input, 10) === problem.answer) {
      onUnlock();
    } else {
      setWrong(true);
      setInput('');
      setTimeout(() => setWrong(false), 1500);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-kid p-6 max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Parent verification"
      >
        <h2 className="text-2xl font-extrabold mb-2">
          👋 Grown-Up Check
        </h2>
        <p className="text-gray-500 mb-4 text-base">
          {message ?? 'This needs a grown-up. Solve to continue:'}
        </p>

        <p className="text-3xl font-extrabold mb-4 text-kid-purple">
          {problem.a} × {problem.b} = ?
        </p>

        <input
          type="number"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          autoFocus
          className="text-2xl text-center w-24 py-2 border-3 border-gray-200
                     rounded-kid outline-none focus:border-kid-purple
                     transition-colors"
        />

        <div className="flex gap-3 justify-center mt-5">
          <button
            onClick={onCancel}
            className="px-5 py-3 bg-gray-100 rounded-kid font-bold
                       active:scale-95 transition-transform min-h-[48px]"
          >
            Go Back
          </button>
          <button
            onClick={check}
            className="px-5 py-3 bg-kid-purple text-white rounded-kid font-bold
                       active:scale-95 transition-transform min-h-[48px]"
          >
            Check ✓
          </button>
        </div>

        {wrong && (
          <p className="text-kid-red font-bold mt-3 animate-pulse">
            Not quite — try again! 🤔
          </p>
        )}
      </div>
    </div>
  );
}