export type CoachArea = 'studio' | 'flipbook' | 'gallery';

const KEYS: Record<CoachArea, string> = {
  studio: 'coach_studio_seen',
  flipbook: 'coach_flipbook_seen',
  gallery: 'coach_gallery_seen',
};

export interface CoachStep {
  coachId: string;
  message: string;
  placement: 'above' | 'below' | 'left' | 'right';
}

export const SEQUENCES: Record<CoachArea, CoachStep[]> = {
  studio: [
    { coachId: 'studio-brush', message: 'Pick a brush!', placement: 'below' },
    { coachId: 'studio-color', message: 'Choose a color!', placement: 'above' },
    { coachId: 'studio-save', message: 'Save to your museum!', placement: 'above' },
  ],
  flipbook: [
    { coachId: 'flip-add', message: 'Tap to add a new page!', placement: 'above' },
    { coachId: 'flip-dup', message: 'Copy this page!', placement: 'above' },
    { coachId: 'flip-ghost', message: 'See your last drawing faintly', placement: 'above' },
    { coachId: 'flip-play', message: 'Watch your animation!', placement: 'above' },
  ],
  gallery: [
    { coachId: 'gallery-art-0', message: 'Tap to see your art!', placement: 'below' },
    { coachId: 'gallery-room', message: 'Organize into rooms!', placement: 'below' },
  ],
};

export function isCoachSeen(area: CoachArea): boolean {
  try {
    return localStorage.getItem(KEYS[area]) === '1';
  } catch {
    return true; // If localStorage unavailable, skip coach
  }
}

export function markCoachSeen(area: CoachArea): void {
  try {
    localStorage.setItem(KEYS[area], '1');
  } catch { /* silent */ }
}

export function resetCoachMarks(): void {
  try {
    for (const key of Object.values(KEYS)) {
      localStorage.removeItem(key);
    }
  } catch { /* silent */ }
}
