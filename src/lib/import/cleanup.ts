/**
 * Cleans up a photographed hand drawing:
 * - Auto-levels (contrast boost)
 * - Optional threshold for line art
 * Returns a new canvas element.
 */
export function cleanupDrawingScan(
  source: HTMLCanvasElement | HTMLImageElement,
  options: {
    contrast?: number; // 0-200, default 140
    brightness?: number; // -100 to 100, default 10
    threshold?: number; // 0-255 or null for no threshold
  } = {},
): HTMLCanvasElement {
  const { contrast = 140, brightness = 10, threshold = null } = options;

  const w = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth;
  const h = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight;

  const output = document.createElement('canvas');
  output.width = w;
  output.height = h;
  const ctx = output.getContext('2d')!;

  // Apply CSS filters for contrast/brightness
  ctx.filter = `contrast(${contrast}%) brightness(${100 + brightness}%)`;
  ctx.drawImage(source, 0, 0, w, h);
  ctx.filter = 'none';

  // Optional: hard threshold for clean line art
  if (threshold !== null) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const val = avg > threshold ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      // Keep alpha as-is
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return output;
}

/**
 * Auto-crops whitespace around a drawing.
 */
export function autoCrop(
  source: HTMLCanvasElement,
  padding: number = 20,
): HTMLCanvasElement {
  const ctx = source.getContext('2d')!;
  const { width: w, height: h } = source;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  let top = h,
    bottom = 0,
    left = w,
    right = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // Check if pixel is not white (or near-white)
      if (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  // Nothing found — return original
  if (top >= bottom || left >= right) return source;

  // Add padding
  top = Math.max(0, top - padding);
  left = Math.max(0, left - padding);
  bottom = Math.min(h, bottom + padding);
  right = Math.min(w, right + padding);

  const cropW = right - left;
  const cropH = bottom - top;

  const output = document.createElement('canvas');
  output.width = cropW;
  output.height = cropH;
  const outCtx = output.getContext('2d')!;
  outCtx.drawImage(source, left, top, cropW, cropH, 0, 0, cropW, cropH);

  return output;
}
