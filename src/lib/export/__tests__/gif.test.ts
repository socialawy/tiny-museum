import { describe, it, expect } from 'vitest';
import { exportToGif } from '../gif';

describe('GIF Export', () => {
  it('generates a GIF blob from a single canvas frame', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    const options = {
      width: 100,
      height: 100,
      fps: 4,
      frames: [canvas],
    };

    const blob = await exportToGif(options);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/gif');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('generates a GIF blob from multiple canvas frames', async () => {
    const c1 = document.createElement('canvas');
    const c2 = document.createElement('canvas');

    const options = {
      width: 100,
      height: 100,
      fps: 4,
      frames: [c1, c2],
    };

    const blob = await exportToGif(options);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/gif');
  });
});
