'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { type CoachStep, SEQUENCES } from '@/lib/coach';

interface CoachMarkOverlayProps {
  area: string;
  onComplete: () => void;
  onSkip?: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const TRANSITION_MS = 300;

/**
 * Click handling strategy:
 * - The outer container has `pointer-events: none` so ALL clicks pass through to
 *   the real DOM elements underneath the overlay.
 * - Four backdrop panels (top/bottom/left/right around the cutout) have
 *   `pointer-events: auto` + `onClick={dismiss}` — clicking the dimmed area dismisses.
 * - The cutout area itself has NO overlay element — clicks land on the real element.
 * - We listen for clicks on the real target element to advance the sequence.
 * - The Skip button and speech bubble have `pointer-events: auto` for their own clicks.
 */
export function CoachMarkOverlay({ area, onComplete, onSkip }: CoachMarkOverlayProps) {
  const sequence = useMemo(() => SEQUENCES[area as keyof typeof SEQUENCES] || [], [area]);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const skipRef = useRef(false);

  // Find the current valid step (skip missing targets)
  const findNextValidStep = useCallback(
    (from: number): number => {
      for (let i = from; i < sequence.length; i++) {
        const el = document.querySelector(`[data-coach="${sequence[i].coachId}"]`);
        if (el) return i;
      }
      return -1; // No more valid steps
    },
    [sequence],
  );

  // Measure current target
  const measureTarget = useCallback(() => {
    if (step >= sequence.length) return;
    const el = document.querySelector(`[data-coach="${sequence[step].coachId}"]`);
    if (!el) {
      const next = findNextValidStep(step + 1);
      if (next === -1) onComplete();
      else setStep(next);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - PADDING,
      left: r.left - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
    });
  }, [step, sequence, findNextValidStep, onComplete]);

  // Initial step: find first valid
  useEffect(() => {
    const first = findNextValidStep(0);
    if (first === -1) {
      onComplete();
      return;
    }
    setStep(first);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure whenever step changes
  useEffect(() => {
    measureTarget();
    const handler = () => measureTarget();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [measureTarget]);

  const advance = useCallback(() => {
    if (skipRef.current) return;
    setTransitioning(true);
    const next = findNextValidStep(step + 1);
    if (next === -1) {
      onComplete();
      return;
    }
    setTimeout(() => {
      setStep(next);
      setTransitioning(false);
    }, TRANSITION_MS);
  }, [step, findNextValidStep, onComplete]);

  const dismiss = useCallback(() => {
    skipRef.current = true;
    if (onSkip) onSkip();
    else onComplete();
  }, [onComplete, onSkip]);

  // Listen for clicks on the real highlighted element (clicks pass through to it)
  useEffect(() => {
    if (!rect) return;
    const el = document.querySelector(`[data-coach="${sequence[step].coachId}"]`);
    if (!el) return;

    const handler = () => {
      // The real element already received the click. Now advance.
      requestAnimationFrame(() => advance());
    };
    el.addEventListener('click', handler, { once: true });
    return () => el.removeEventListener('click', handler);
  }, [step, rect, sequence, advance]);

  if (!rect || step >= sequence.length) return null;

  const current = sequence[step];
  const validCount = sequence.filter(
    (s: CoachStep) => document.querySelector(`[data-coach="${s.coachId}"]`) !== null,
  ).length;
  const currentValidIndex = sequence
    .slice(0, step + 1)
    .filter((s: CoachStep) => document.querySelector(`[data-coach="${s.coachId}"]`) !== null).length;

  // Bubble position
  const bubbleStyle: React.CSSProperties = {};
  if (current.placement === 'below') {
    bubbleStyle.top = rect.top + rect.height + 12;
    bubbleStyle.left = rect.left + rect.width / 2;
    bubbleStyle.transform = 'translateX(-50%)';
  } else if (current.placement === 'above') {
    bubbleStyle.bottom = window.innerHeight - rect.top + 12;
    bubbleStyle.left = rect.left + rect.width / 2;
    bubbleStyle.transform = 'translateX(-50%)';
  } else if (current.placement === 'left') {
    bubbleStyle.top = rect.top + rect.height / 2;
    bubbleStyle.right = window.innerWidth - rect.left + 12;
    bubbleStyle.transform = 'translateY(-50%)';
  } else {
    bubbleStyle.top = rect.top + rect.height / 2;
    bubbleStyle.left = rect.left + rect.width + 12;
    bubbleStyle.transform = 'translateY(-50%)';
  }

  // Compute 4 backdrop panels around the cutout (each is a clickable dim area)
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  return createPortal(
    <div
      className="fixed inset-0"
      style={{ zIndex: 900, pointerEvents: 'none' }}
    >
      {/* 4 backdrop panels around the cutout — clicking any dismisses */}
      {/* Top panel */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: vw, height: Math.max(0, rect.top),
          background: 'rgba(0,0,0,0.6)', pointerEvents: 'auto',
          transition: `all ${TRANSITION_MS}ms ease-in-out`,
        }}
        onClick={dismiss}
      />
      {/* Bottom panel */}
      <div
        style={{
          position: 'fixed', top: rect.top + rect.height, left: 0,
          width: vw, height: Math.max(0, vh - rect.top - rect.height),
          background: 'rgba(0,0,0,0.6)', pointerEvents: 'auto',
          transition: `all ${TRANSITION_MS}ms ease-in-out`,
        }}
        onClick={dismiss}
      />
      {/* Left panel */}
      <div
        style={{
          position: 'fixed', top: rect.top, left: 0,
          width: Math.max(0, rect.left), height: rect.height,
          background: 'rgba(0,0,0,0.6)', pointerEvents: 'auto',
          transition: `all ${TRANSITION_MS}ms ease-in-out`,
        }}
        onClick={dismiss}
      />
      {/* Right panel */}
      <div
        style={{
          position: 'fixed', top: rect.top, left: rect.left + rect.width,
          width: Math.max(0, vw - rect.left - rect.width), height: rect.height,
          background: 'rgba(0,0,0,0.6)', pointerEvents: 'auto',
          transition: `all ${TRANSITION_MS}ms ease-in-out`,
        }}
        onClick={dismiss}
      />

      {/* Cutout highlight ring (visual only, no pointer events) */}
      <div
        className="absolute rounded-xl"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: '2px solid rgba(108, 92, 231, 0.6)',
          pointerEvents: 'none',
          transition: `all ${TRANSITION_MS}ms ease-in-out`,
          opacity: transitioning ? 0.5 : 1,
        }}
      />

      {/* Speech bubble */}
      <div
        className="fixed px-5 py-3 bg-white rounded-2xl shadow-xl max-w-[280px] text-center"
        style={{
          ...bubbleStyle,
          pointerEvents: 'none',
          transition: `all ${TRANSITION_MS}ms ease-in-out`,
          opacity: transitioning ? 0 : 1,
          zIndex: 902,
        }}
      >
        <p className="text-lg font-extrabold text-kid-purple">{current.message}</p>
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: validCount }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{
                backgroundColor: i < currentValidIndex ? '#6C5CE7' : '#E0E0E0',
                transform: i === currentValidIndex - 1 ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Skip button */}
      <button
        className="fixed top-4 right-4 px-4 py-2 bg-white/90 rounded-full
                   text-sm font-bold text-gray-500 active:scale-95 transition-transform"
        style={{
          zIndex: 903,
          pointerEvents: 'auto',
          marginTop: 'env(safe-area-inset-top, 0px)',
          marginRight: 'env(safe-area-inset-right, 0px)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
      >
        Skip
      </button>
    </div>,
    document.body,
  );
}
