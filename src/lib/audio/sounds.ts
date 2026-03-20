/**
 * Tiny Museum Sound System
 * Uses Web Audio API to generate sounds procedurally.
 * No external files needed — instant, offline, tiny.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silently fail — audio is never critical
  }
}

function playChime(notes: number[], gap: number = 0.08) {
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.12), i * gap * 1000);
  });
}

// ── Sound Library ──

export const sounds = {
  /** Brush/tool switch — soft click */
  toolSwitch: () => playTone(800, 0.06, 'square', 0.08),

  /** Color selection — gentle pop */
  colorPop: () => playTone(1200, 0.08, 'sine', 0.1),

  /** Save artwork — ascending chime */
  save: () => playChime([523, 659, 784], 0.1),

  /** Send to gallery — triumphant chord */
  celebrate: () => playChime([523, 659, 784, 1047], 0.12),

  /** Delete confirmation — descending */
  delete: () => playChime([784, 523], 0.15),

  /** Add shape/sticker — sparkle */
  sparkle: () => {
    playTone(1400, 0.05, 'sine', 0.08);
    setTimeout(() => playTone(1800, 0.05, 'sine', 0.06), 60);
    setTimeout(() => playTone(2200, 0.08, 'sine', 0.04), 120);
  },

  /** Gallery footstep — soft thud */
  footstep: () => playTone(200, 0.08, 'triangle', 0.06),

  /** Undo — soft backward */
  undo: () => playChime([600, 500], 0.06),

  /** Redo — soft forward */
  redo: () => playChime([500, 600], 0.06),

  /** Error / can't do that — gentle buzz */
  nope: () => playTone(200, 0.15, 'sawtooth', 0.05),

  /** Room select — door open */
  roomSwitch: () => playChime([400, 600, 500], 0.08),
};

export type SoundName = keyof typeof sounds;
