// src/components/canvas/StudioCanvas.tsx

'use client';

import { useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import { saveArtwork } from '@/lib/storage/artworks';
import { useUIStore } from '@/stores/ui.store';
import { Toolbar } from './Toolbar';

export default function StudioCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const celebrate = useUIStore((s) => s.celebrate);
    const [saving, setSaving] = useState(false);
    const [currentArtworkId, setCurrentArtworkId] = useState<string | undefined>();

    const {
        canvas,
        isReady,
        undo,
        redo,
        canUndo,
        canRedo,
    } = useFabricCanvas(containerRef);

    // Quick save — stays in studio
    const handleSave = useCallback(async () => {
        if (!canvas || saving) return;
        setSaving(true);
        try {
            const artwork = await saveArtwork(canvas, currentArtworkId);
            setCurrentArtworkId(artwork.id);
            // Brief visual feedback
            celebrate();
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    }, [canvas, saving, currentArtworkId, celebrate]);

    // Save + go to gallery
    const handleSendToGallery = useCallback(async () => {
        if (!canvas || saving) return;
        setSaving(true);
        try {
            await saveArtwork(canvas, currentArtworkId);
            celebrate();
            // Small delay so the celebration is visible
            setTimeout(() => {
                router.push('/gallery');
            }, 600);
        } catch (err) {
            console.error('Save failed:', err);
            setSaving(false);
        }
    }, [canvas, saving, currentArtworkId, celebrate, router]);

    return (
        <div className="flex flex-col h-[100dvh] bg-studio-bg">
            {/* Top toolbar */}
            <Toolbar
                canvas={canvas}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                onSave={handleSave}
                onSendToGallery={handleSendToGallery}
            />

            {/* Canvas area */}
            <div
                ref={containerRef}
                className="flex-1 relative overflow-hidden"
                style={{ touchAction: 'none' }}
            >
                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-studio-bg">
                        <div className="text-center">
                            <p className="text-5xl mb-3 animate-bounce">🎨</p>
                            <p className="text-lg font-bold text-gray-400">
                                Getting your studio ready...
                            </p>
                        </div>
                    </div>
                )}

                {/* Save indicator */}
                {saving && (
                    <div className="absolute top-3 right-3 bg-white/90 rounded-kid px-4 py-2 shadow-lg z-50 animate-pulse">
                        <span className="text-lg">💾 Saving...</span>
                    </div>
                )}
            </div>
        </div>
    );
}