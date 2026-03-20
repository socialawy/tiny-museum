'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { Canvas } from 'fabric';
import { createTinyCanvas, resizeTinyCanvas } from '@/lib/fabric/setup';
import { attachTouchGestures } from '@/lib/fabric/touch';
import { CanvasHistory } from '@/lib/fabric/history';

export function useFabricCanvas(containerRef: React.RefObject<HTMLDivElement | null>) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const historyRef = useRef<CanvasHistory | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Sync history UI state
  const syncHistoryState = useCallback(() => {
    if (historyRef.current) {
      setCanUndo(historyRef.current.canUndo);
      setCanRedo(historyRef.current.canRedo);
    }
  }, []);

  // Initialize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create the <canvas> element
    const el = document.createElement('canvas');
    container.appendChild(el);
    canvasElRef.current = el;

    // Size to container
    const rect = container.getBoundingClientRect();
    const canvas = createTinyCanvas({
      container: el,
      width: rect.width,
      height: rect.height,
    });
    canvasRef.current = canvas;

    // History
    const history = new CanvasHistory(canvas);
    historyRef.current = history;

    // Touch gestures
    const detachTouch = attachTouchGestures(canvas);

    // Track changes for undo/redo
    const onChanged = () => {
      history.capture();
      syncHistoryState();
    };
    canvas.on('path:created', onChanged);
    canvas.on('object:modified', onChanged);

    // Resize observer
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

    // Cleanup
    cleanupRef.current = () => {
      resizeObserver.disconnect();
      detachTouch();
      canvas.off('path:created', onChanged);
      canvas.off('object:modified', onChanged);
      canvas.dispose();
      if (el.parentNode) el.parentNode.removeChild(el);
      canvasRef.current = null;
      historyRef.current = null;
      canvasElRef.current = null;
    };

    return () => {
      cleanupRef.current?.();
    };
  }, [containerRef, syncHistoryState]);

  // Undo / Redo
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
