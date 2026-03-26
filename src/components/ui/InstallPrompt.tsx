'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone: boolean }).standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    // Check if previously dismissed
    if (localStorage.getItem('pwa_prompt_dismissed') === 'true') {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIOSDevice) {
      setIsIOS(true);
      setShowPrompt(true);
      return;
    }

    // Listen for beforeinstallprompt for Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
    }

    // We can't use the prompt again
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-bounce-in">
      <div className="bg-white border-4 border-kid-purple rounded-3xl p-4 shadow-[0_8px_0_#9167e6] flex flex-col gap-3 max-w-sm mx-auto">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🏛️</div>
          <div>
            <h3 className="font-bold text-lg text-kid-dark">Add to Home Screen!</h3>
            <p className="text-sm text-gray-500 font-semibold leading-tight mt-1">
              {isIOS
                ? "Tap the share button and choose 'Add to Home Screen' to play like an app!"
                : "Install Mira's Museum to play like an app!"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 rounded-xl font-bold text-gray-500 bg-gray-100 border-2 border-gray-200 active:bg-gray-200 active:scale-95 transition-all"
          >
            Later
          </button>

          {!isIOS && (
            <button
              onClick={handleInstall}
              className="flex-1 py-2 rounded-xl font-bold text-white bg-kid-green border-b-4 border-green-600 active:border-b-0 active:translate-y-1 transition-all"
            >
              Install!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
