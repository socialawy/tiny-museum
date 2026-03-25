'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ParentGate } from '@/components/ui/ParentGate';
import { resetCoachMarks } from '@/lib/coach';

export default function SettingsPage() {
  const router = useRouter();
  const [isGateOpen, setIsGateOpen] = useState(true);
  const [pin, setPin] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedPin = localStorage.getItem('tiny_museum_pin');
    if (storedPin) {
      setPin(storedPin);
    }
  }, []);

  const handleSavePin = () => {
    if (pin.length === 0) {
      localStorage.removeItem('tiny_museum_pin');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    if (pin.length !== 4) {
      alert('PIN must be exactly 4 digits');
      return;
    }

    localStorage.setItem('tiny_museum_pin', pin);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearPin = () => {
    setPin('');
    localStorage.removeItem('tiny_museum_pin');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isGateOpen) {
    return (
      <div className="flex-1 flex flex-col h-full relative p-4 bg-museum-canvas">
        <ParentGate
          onUnlock={() => setIsGateOpen(false)}
          onCancel={() => router.push('/')}
          message="Grown-ups only: Please solve to access Settings."
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full px-6 text-center"
      style={{
        paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="w-full max-w-md bg-white p-8 rounded-kid border-4 border-museum-frame shadow-xl">
        <h1 className="text-3xl font-extrabold text-kid-purple mb-6">⚙️ Settings</h1>

        <div className="mb-6 text-left">
          <h2 className="text-xl font-bold mb-2">Studio PIN Lock</h2>
          <p className="text-gray-500 mb-4 text-sm">
            Set a 4-digit PIN to lock the Studio. This prevents anyone from creating or
            editing art without the PIN.
          </p>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPin(val);
              }}
              placeholder="No PIN set"
              className="text-3xl tracking-widest text-center py-4 border-4 border-gray-200 rounded-kid outline-none focus:border-kid-purple transition-colors font-mono"
            />

            <div className="flex gap-4 mt-2">
              <button
                onClick={handleClearPin}
                className="flex-1 py-3 bg-gray-100 rounded-kid font-bold text-gray-700 active:scale-95 transition-transform"
              >
                Clear PIN
              </button>
              <button
                onClick={handleSavePin}
                className="flex-1 py-3 bg-kid-purple text-white rounded-kid font-bold active:scale-95 transition-transform"
              >
                Save PIN
              </button>
            </div>

            {saved && (
              <p className="text-kid-green font-bold text-center mt-2 animate-bounce">
                Settings Saved! ✨
              </p>
            )}
          </div>
        </div>

        <div className="mb-6 text-left border-t border-gray-100 pt-6">
          <h2 className="text-xl font-bold mb-2">Tutorials</h2>
          <p className="text-gray-500 mb-4 text-sm">
            Want to see the guided tours again? Click below to reset them.
          </p>
          <button
            onClick={() => {
              resetCoachMarks();
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            className="w-full py-3 bg-white border-2 border-kid-purple text-kid-purple rounded-kid font-bold active:scale-95 transition-transform"
          >
            ✨ Replay All Tutorials
          </button>
        </div>

        <button
          onClick={() => router.push('/')}
          className="mt-8 px-8 py-3 bg-gray-100 rounded-kid font-bold w-full active:scale-95 transition-transform"
        >
          Back to Museum
        </button>
      </div>
    </div>
  );
}
