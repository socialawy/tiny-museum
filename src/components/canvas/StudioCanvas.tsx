'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import { saveArtwork, loadArtwork } from '@/lib/storage/artworks';
import { addImageToCanvas } from '@/lib/fabric/shapes';
import { useUIStore } from '@/stores/ui.store';
import { Toolbar } from './Toolbar';
import { ImportPanel } from './ImportPanel';
import { ShapePanel } from './ShapePanel';
import { BackgroundPicker } from './BackgroundPicker';

type Panel = 'none' | 'import' | 'shapes' | 'background';

export default function StudioCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const celebrate = useUIStore((s) => s.celebrate);
  const [saving, setSaving] = useState(false);
  const [currentArtworkId, setCurrentArtworkId] = useState<
    string | undefined
  >(editId ?? undefined);
  const [activePanel, setActivePanel] = useState<Panel>('none');
  const [activeColor, setActiveColor] = useState('#FF6B6B');
  const [loaded, setLoaded] = useState(false);

  const { canvas, isReady, undo, redo, canUndo, canRedo } =
    useFabricCanvas(containerRef);

  // ── Load existing artwork when editing ──
  useEffect(() => {
    if (!canvas || !isReady || !editId || loaded) return;

    let cancelled = false;

    (async () => {
      try {
        const artwork = await loadArtwork(editId);
        if (cancelled || !artwork) {
          console.warn('Artwork not found:', editId);
          setLoaded(true);
          return;
        }

        const json = JSON.parse(artwork.canvasJSON);
        await canvas.loadFromJSON(json);
        canvas.renderAll();
        setCurrentArtworkId(editId);
        setLoaded(true);
      } catch (err) {
        console.error('Failed to load artwork:', err);
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canvas, isReady, editId, loaded]);

  // ── If no editId, mark as loaded immediately ──
  useEffect(() => {
    if (!editId) setLoaded(true);
  }, [editId]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    if (!canvas || saving) return;
    setSaving(true);
    try {
      const artwork = await saveArtwork(canvas, currentArtworkId);
      setCurrentArtworkId(artwork.id);
      celebrate();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [canvas, saving, currentArtworkId, celebrate]);

  // ── Send to Gallery ──
  const handleSendToGallery = useCallback(async () => {
    if (!canvas || saving) return;
    setSaving(true);
    try {
      const artwork = await saveArtwork(canvas, currentArtworkId);
      setCurrentArtworkId(artwork.id);
      celebrate();
      setTimeout(() => router.push('/gallery'), 600);
    } catch (err) {
      console.error('Save failed:', err);
      setSaving(false);
    }
  }, [canvas, saving, currentArtworkId, celebrate, router]);

  // ── Import handler ──
  const handleImport = useCallback(
    async (imageUrl: string) => {
      if (!canvas) return;
      await addImageToCanvas(canvas, imageUrl, 300);
      setActivePanel('none');
    },
    [canvas],
  );

  // ── Loading state for edit mode ──
  const showLoading = !isReady || (editId && !loaded);

  return (
    <div className="flex flex-col h-[100dvh] bg-studio-bg">
      {/* Toolbar */}
      <Toolbar
        canvas={canvas}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onSave={handleSave}
        onSendToGallery={handleSendToGallery}
        onOpenImport={() => setActivePanel('import')}
        onOpenShapes={() => setActivePanel('shapes')}
        onOpenBackground={() => setActivePanel('background')}
      />

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {showLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-studio-bg z-30">
            <div className="text-center">
              <p className="text-5xl mb-3 animate-bounce">
                {editId ? '🖼️' : '🎨'}
              </p>
              <p className="text-lg font-bold text-gray-400">
                {editId ? 'Loading your artwork...' : 'Getting your studio ready...'}
              </p>
            </div>
          </div>
        )}
        {saving && (
          <div className="absolute top-3 right-3 bg-white/90 rounded-kid px-4 py-2 shadow-lg z-40 animate-pulse">
            💾 Saving...
          </div>
        )}
      </div>

      {/* Panels */}
      {activePanel === 'import' && (
        <ImportPanel
          onImport={handleImport}
          onClose={() => setActivePanel('none')}
        />
      )}
      {activePanel === 'shapes' && (
        <ShapePanel
          canvas={canvas}
          activeColor={activeColor}
          onClose={() => setActivePanel('none')}
        />
      )}
      {activePanel === 'background' && (
        <BackgroundPicker
          canvas={canvas}
          onClose={() => setActivePanel('none')}
        />
      )}
    </div>
  );
}