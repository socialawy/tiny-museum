'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import {
  saveArtwork,
  loadArtwork,
  updatePublishedUrl,
  dataURLtoBlob,
} from '@/lib/storage/artworks';
import { publishArtwork } from '@/lib/cloud/publish';
import { addImageToCanvas } from '@/lib/fabric/shapes';
import { KID_PALETTE } from '@/lib/fabric/tools';
import { useUIStore } from '@/stores/ui.store';
import { Toolbar } from './Toolbar';
import { ImportPanel } from './ImportPanel';
import { ShapePanel } from './ShapePanel';
import { BackgroundPicker } from './BackgroundPicker';
import { StickerPanel } from './StickerPanel';
import { useSounds } from '@/hooks/useSounds';

/** Returns true when the canvas has zero user content */
function isCanvasEmpty(fabricCanvas: Record<string, unknown>): boolean {
  try {
    const getObjectsFn = fabricCanvas.getObjects as (() => unknown[]) | undefined;
    const objects = getObjectsFn?.call(fabricCanvas) ?? [];
    return objects.length === 0;
  } catch {
    return true;
  }
}

type Panel = 'none' | 'import' | 'shapes' | 'background' | 'stickers';

export default function StudioCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const celebrate = useUIStore((s) => s.celebrate);
  const { playSound } = useSounds();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedLink, setPublishedLink] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
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
      if (isCanvasEmpty(canvas as unknown as Record<string, unknown>)) return;

      const doSave = async () => {
        try {
          await saveArtwork(
            canvas as unknown as Record<string, unknown>,
            currentArtworkId,
          );
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
    if (isCanvasEmpty(canvas as unknown as Record<string, unknown>)) {
      playSound('toolSwitch'); // subtle feedback, no save
      return;
    }
    setSaving(true);
    try {
      const artwork = await saveArtwork(
        canvas as unknown as Record<string, unknown>,
        currentArtworkId,
      );
      setCurrentArtworkId(artwork.id);
      celebrate();
      playSound('save');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [canvas, saving, currentArtworkId, celebrate, playSound]);

  const handleSendToGallery = useCallback(async () => {
    if (!canvas || saving) return;
    if (isCanvasEmpty(canvas as unknown as Record<string, unknown>)) {
      router.push('/gallery');
      return;
    }
    setSaving(true);
    try {
      const artwork = await saveArtwork(
        canvas as unknown as Record<string, unknown>,
        currentArtworkId,
      );
      setCurrentArtworkId(artwork.id);
      celebrate();
      playSound('celebrate');
      setTimeout(() => router.push('/gallery'), 600);
    } catch (err) {
      console.error('Save failed:', err);
      setSaving(false);
    }
  }, [canvas, saving, currentArtworkId, celebrate, playSound, router]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!publishedLink && !publishError) return;
    const timer = setTimeout(() => {
      setPublishedLink(null);
      setPublishError(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [publishedLink, publishError]);

  const handlePublish = useCallback(async () => {
    if (!canvas || !currentArtworkId || publishing) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });
      const imageBlob = dataURLtoBlob(dataUrl);
      const artwork = await loadArtwork(currentArtworkId);
      if (!artwork) throw new Error('Artwork not found');
      const url = await publishArtwork(artwork, imageBlob);
      await updatePublishedUrl(currentArtworkId, url);
      setPublishedLink(url);
      playSound('celebrate');
    } catch (err) {
      console.error('Publish failed:', err);
      setPublishError('Could not publish. Please try again.');
    } finally {
      setPublishing(false);
    }
  }, [canvas, currentArtworkId, publishing, playSound]);

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
    <div className="relative flex flex-col h-[100dvh] bg-studio-bg">
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
        onPublish={currentArtworkId ? handlePublish : undefined}
        publishing={publishing}
        publishedLink={publishedLink}
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
      {(publishedLink || publishError) && (
        <div className="absolute top-16 right-2 z-50 bg-white rounded-kid shadow-lg p-3 text-sm max-w-[220px]">
          {publishedLink ? (
            <>
              <p className="font-bold text-kid-purple mb-1">Published! 🎉</p>
              <a
                href="/gallery/published"
                target="_blank"
                rel="noreferrer"
                className="block text-blue-600 underline text-xs mb-1"
              >
                View online gallery →
              </a>
              <a
                href={publishedLink}
                target="_blank"
                rel="noreferrer"
                className="block text-blue-400 underline text-xs"
              >
                Open image →
              </a>
            </>
          ) : (
            <p className="text-red-500 text-xs">{publishError}</p>
          )}
          <button
            onClick={() => {
              setPublishedLink(null);
              setPublishError(null);
            }}
            className="absolute top-1 right-2 text-gray-400 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
