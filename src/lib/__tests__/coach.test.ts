import { describe, it, expect, beforeEach } from 'vitest';
import { isCoachSeen, markCoachSeen, resetAllCoach } from '../coach';

describe('Coach localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns false for unseen area', () => {
    expect(isCoachSeen('studio')).toBe(false);
  });

  it('returns true after marking seen', () => {
    markCoachSeen('studio');
    expect(isCoachSeen('studio')).toBe(true);
  });

  it('areas are independent', () => {
    markCoachSeen('studio');
    expect(isCoachSeen('flipbook')).toBe(false);
    expect(isCoachSeen('gallery')).toBe(false);
  });

  it('resetAllCoach clears all areas', () => {
    markCoachSeen('studio');
    markCoachSeen('flipbook');
    markCoachSeen('gallery');
    resetAllCoach();
    expect(isCoachSeen('studio')).toBe(false);
    expect(isCoachSeen('flipbook')).toBe(false);
    expect(isCoachSeen('gallery')).toBe(false);
  });

  it('resetAllCoach does not clear unrelated localStorage keys', () => {
    localStorage.setItem('some_other_key', 'value');
    markCoachSeen('studio');
    resetAllCoach();
    expect(localStorage.getItem('some_other_key')).toBe('value');
  });
});
