'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { Canvas } from 'fabric';
import { createTinyCanvas, resizeTinyCanvas } from '@/lib/fabric/setup';
import { attachTouchGestures } from '@/lib/fabric/touch';
import { CanvasHistory } from '@/lib/fabric/history';

export function useFabricCanvas(containerRef: React.RefObject<HTMLDivElement | null>) {
  const canvasRef = useRef<Canvas | null>(null);
  const historyRef = useRef<CanvasHistory | null>(null);
  const mountedRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncHistoryState = useCallback(() => {
    if (historyRef.current) {
      setCanUndo(historyRef.current.canUndo);
      setCanRedo(historyRef.current.canRedo);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Strict mode guard: if canvas already exists, skip
    if (mountedRef.current && canvasRef.current) return;
    mountedRef.current = true;

    // Clean any leftover canvas elements (from HMR)
    const existingCanvases = container.querySelectorAll('canvas');
    existingCanvases.forEach((c) => c.remove());

    // Also clean Fabric's wrapper divs
    const existingWrappers = container.querySelectorAll('.canvas-container');
    existingWrappers.forEach((w) => w.remove());

    const el = document.createElement('canvas');
    container.appendChild(el);

    const rect = container.getBoundingClientRect();
    const canvas = createTinyCanvas({
      container: el,
      width: rect.width || 800,
      height: rect.height || 600,
    });
    canvasRef.current = canvas;

    const history = new CanvasHistory(canvas);
    historyRef.current = history;

    const detachTouch = attachTouchGestures(canvas);

    const onChanged = () => {
      history.capture();
      syncHistoryState();
    };
    canvas.on('path:created', onChanged);
    canvas.on('object:modified', onChanged);
    canvas.on('object:added', onChanged);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          resizeTinyCanvas(canvas, width, height);
        }
      }
    });
    resizeObserver.observe(container);

    setIsReady(true);

    return () => {
      mountedRef.current = false;
      resizeObserver.disconnect();
      detachTouch();
      canvas.off('path:created', onChanged);
      canvas.off('object:modified', onChanged);
      canvas.off('object:added', onChanged);
      canvas.dispose();
      canvasRef.current = null;
      historyRef.current = null;
      setIsReady(false);
    };
  }, [containerRef, syncHistoryState]);

  const undo = useCallback(async () => {
    await historyRef.current?.undo();
    syncHistoryState();
  }, [syncHistoryState]);

  const redo = useCallback(async () => {
    await historyRef.current?.redo();
    syncHistoryState();
  }, [syncHistoryState]);

  return {
    canvas: canvasRef.current,
    isReady,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
