'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import { saveArtwork, loadArtwork } from '@/lib/storage/artworks';
import { addImageToCanvas } from '@/lib/fabric/shapes';
import { KID_PALETTE } from '@/lib/fabric/tools';
import { useUIStore } from '@/stores/ui.store';
import { Toolbar } from './Toolbar';
import { ImportPanel } from './ImportPanel';
import { ShapePanel } from './ShapePanel';
import { BackgroundPicker } from './BackgroundPicker';
import { StickerPanel } from './StickerPanel';

type Panel = 'none' | 'import' | 'shapes' | 'background' | 'stickers';

export default function StudioCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const celebrate = useUIStore((s) => s.celebrate);
  const [saving, setSaving] = useState(false);
  const [currentArtworkId, setCurrentArtworkId] = useState<string | undefined>(
    editId ?? undefined,
  );
  const [activePanel, setActivePanel] = useState<Panel>('none');
  const [loaded, setLoaded] = useState(false);

  // Lifted state — shared between toolbar, shapes, stickers
  const [activeColor, setActiveColor] = useState<string>(KID_PALETTE[0]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const { canvas, isReady, undo, redo, canUndo, canRedo } = useFabricCanvas(containerRef);

  // Load existing artwork
  useEffect(() => {
    if (!canvas || !isReady || !editId || loaded) return;
    let cancelled = false;
    (async () => {
      try {
        const artwork = await loadArtwork(editId);
        if (cancelled || !artwork) {
          setLoaded(true);
          return;
        }
        await canvas.loadFromJSON(JSON.parse(artwork.canvasJSON));
        canvas.renderAll();
        setCurrentArtworkId(editId);
      } catch (err) {
        console.error('Load failed:', err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canvas, isReady, editId, loaded]);

  useEffect(() => {
    if (!editId) setLoaded(true);
  }, [editId]);

  // Auto-save every 30 seconds — use idle callback to avoid jank
  useEffect(() => {
    if (!canvas || !isReady || !loaded) return;

    const interval = setInterval(() => {
      if (!currentArtworkId) return;

      const doSave = async () => {
        try {
          await saveArtwork(canvas, currentArtworkId);
        } catch {
          // silent
        }
      };

      // Use requestIdleCallback if available, else just run
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => doSave(), { timeout: 5000 });
      } else {
        doSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [canvas, isReady, loaded, currentArtworkId]);

  // When panels add objects, canvas exits drawing mode.
  // Sync our state to reflect that.
  useEffect(() => {
    if (!canvas) return;
    const syncMode = () => {
      if (!canvas.isDrawingMode && !isSelectMode) {
        setIsSelectMode(true);
      }
    };
    canvas.on('object:added', syncMode);
    return () => {
      canvas.off('object:added', syncMode);
    };
  }, [canvas, isSelectMode]);

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

  const handleImport = useCallback(
    async (imageUrl: string) => {
      if (!canvas) return;
      await addImageToCanvas(canvas, imageUrl, 300);
      setActivePanel('none');
      setIsSelectMode(true);
    },
    [canvas],
  );

  const handleShapePanelClose = useCallback(() => {
    setActivePanel('none');
    // Shape was added → canvas is in select mode now
    if (canvas && !canvas.isDrawingMode) {
      setIsSelectMode(true);
    }
  }, [canvas]);

  const showLoading = !isReady || (editId && !loaded);

  return (
    <div className="flex flex-col h-[100dvh] bg-studio-bg">
      <Toolbar
        canvas={canvas}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        isSelectMode={isSelectMode}
        onSelectModeChange={setIsSelectMode}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onSave={handleSave}
        onSendToGallery={handleSendToGallery}
        onOpenImport={() => setActivePanel('import')}
        onOpenShapes={() => setActivePanel('shapes')}
        onOpenBackground={() => setActivePanel('background')}
        onOpenStickers={() => setActivePanel('stickers')}
      />

      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {showLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-studio-bg z-30">
            <div className="text-center">
              <p className="text-5xl mb-3 animate-bounce">{editId ? '🖼️' : '🎨'}</p>
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

      {activePanel === 'import' && (
        <ImportPanel onImport={handleImport} onClose={() => setActivePanel('none')} />
      )}
      {activePanel === 'shapes' && (
        <ShapePanel
          canvas={canvas}
          activeColor={activeColor}
          onClose={handleShapePanelClose}
        />
      )}
      {activePanel === 'background' && (
        <BackgroundPicker canvas={canvas} onClose={() => setActivePanel('none')} />
      )}
      {activePanel === 'stickers' && (
        <StickerPanel canvas={canvas} onClose={() => setActivePanel('none')} />
      )}
    </div>
  );
}
