'use client';

import { useState, useRef, useEffect } from 'react';
import { openCamera, captureFrame, stopStream } from '@/lib/import/camera';
import { pickFile, processImportedFile, validateFile } from '@/lib/import/file';
import { cleanupDrawingScan, autoCrop } from '@/lib/import/cleanup';
import { BigButton } from '@/components/ui/BigButton';

interface ImportPanelProps {
  onImport: (imageUrl: string, width: number, height: number) => void;
  onClose: () => void;
}

type ImportMode = 'choose' | 'camera' | 'preview';

export function ImportPanel({ onImport, onClose }: ImportPanelProps) {
  const [mode, setMode] = useState<ImportMode>('choose');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewDimensions, setPreviewDimensions] = useState({ w: 0, h: 0 });
  const [enhance, setEnhance] = useState(true);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) stopStream(stream);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [stream, previewUrl]);

  // ── Camera Flow ──

  async function startCamera() {
    setError('');
    try {
      const s = await openCamera();
      setStream(s);
      setMode('camera');
      // Wire to video element after render
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      });
    } catch {
      setError('Could not open camera. Check permissions!');
    }
  }

  function takePhoto() {
    if (!videoRef.current) return;
    const raw = captureFrame(videoRef.current);

    // Stop camera
    if (stream) stopStream(stream);
    setStream(null);

    processCapture(raw);
  }

  // ── File Flow ──

  async function openFilePicker() {
    setError('');
    const file = await pickFile();
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const imported = await processImportedFile(file);

      // Convert to canvas for processing
      const img = new Image();
      img.src = imported.objectUrl;
      await new Promise((res) => {
        img.onload = res;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(imported.objectUrl);
      processCapture(canvas);
    } catch {
      setError('Could not read this file. Try another one!');
    }
  }

  // ── Shared Processing ──

  function processCapture(raw: HTMLCanvasElement) {
    let processed = raw;
    if (enhance) {
      processed = cleanupDrawingScan(raw, { contrast: 140, brightness: 10 });
      processed = autoCrop(processed, 20);
    }

    const url = processed.toDataURL('image/png');
    setPreviewUrl(url);
    setPreviewDimensions({ w: processed.width, h: processed.height });
    setMode('preview');
  }

  function confirmImport() {
    onImport(previewUrl, previewDimensions.w, previewDimensions.h);
  }

  function reset() {
    if (stream) stopStream(stream);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStream(null);
    setPreviewUrl('');
    setMode('choose');
    setError('');
  }

  // ── Render ──

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div className="bg-white rounded-kid max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-xl font-extrabold">
            {mode === 'choose' && '📥 Import'}
            {mode === 'camera' && '📷 Take Photo'}
            {mode === 'preview' && '✨ Preview'}
          </h2>
          <BigButton onClick={onClose} aria-label="Close">
            ✕
          </BigButton>
        </div>

        {/* Content */}
        <div className="p-5">
          {error && (
            <div className="bg-red-50 text-kid-red rounded-xl px-4 py-3 mb-4 font-bold text-sm">
              {error}
            </div>
          )}

          {/* ── Choose mode ── */}
          {mode === 'choose' && (
            <div className="flex flex-col gap-4">
              <button
                onClick={startCamera}
                className="flex items-center gap-4 p-5 bg-studio-bg rounded-kid
                           text-left active:scale-95 transition-transform"
              >
                <span className="text-4xl">📷</span>
                <div>
                  <p className="font-bold text-lg">Take a Photo</p>
                  <p className="text-sm text-gray-500">Snap a picture of your drawing</p>
                </div>
              </button>

              <button
                onClick={openFilePicker}
                className="flex items-center gap-4 p-5 bg-studio-bg rounded-kid
                           text-left active:scale-95 transition-transform"
              >
                <span className="text-4xl">📁</span>
                <div>
                  <p className="font-bold text-lg">Choose a File</p>
                  <p className="text-sm text-gray-500">Pick an image from your device</p>
                </div>
              </button>

              {/* Enhance toggle */}
              <label className="flex items-center gap-3 px-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enhance}
                  onChange={(e) => setEnhance(e.target.checked)}
                  className="w-5 h-5 accent-kid-purple"
                />
                <span className="text-sm font-semibold text-gray-600">
                  ✨ Auto-enhance drawing (cleaner lines)
                </span>
              </label>
            </div>
          )}

          {/* ── Camera mode ── */}
          {mode === 'camera' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-full rounded-xl overflow-hidden bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                <BigButton onClick={reset} aria-label="Cancel">
                  ←
                </BigButton>
                <button
                  onClick={takePhoto}
                  className="w-16 h-16 rounded-full bg-kid-red border-4 border-white
                             shadow-lg active:scale-90 transition-transform"
                  aria-label="Capture"
                />
              </div>
            </div>
          )}

          {/* ── Preview mode ── */}
          {mode === 'preview' && previewUrl && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-full rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full object-contain max-h-64"
                />
              </div>
              <p className="text-sm text-gray-500">
                {previewDimensions.w} × {previewDimensions.h}px
              </p>
              <div className="flex gap-3">
                <BigButton onClick={reset} aria-label="Try again">
                  🔄
                </BigButton>
                <button
                  onClick={confirmImport}
                  className="px-6 py-3 bg-kid-purple text-white rounded-kid
                             font-bold text-lg active:scale-95 transition-transform"
                >
                  Add to Canvas ✨
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
