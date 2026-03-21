/**
 * Simple GIF encoder using canvas frames.
 * No external dependencies — uses the GIF89a spec directly.
 * For Phase 3 we keep it simple: captures canvas snapshots into an animated GIF.
 */

export interface GifExportOptions {
  width: number;
  height: number;
  fps: number;
  frames: HTMLCanvasElement[];
  quality?: number; // 1-20, lower = better quality but slower
}

/**
 * Renders canvas frames to an animated GIF blob.
 * Uses a minimal GIF encoder — no library needed for basic flipbooks.
 */
export async function exportToGif(options: GifExportOptions): Promise<Blob> {
  const { width, height, fps, frames } = options;
  const delay = Math.round(100 / fps); // GIF delay is in centiseconds

  // We'll use the canvas frames to build image data
  // For a clean implementation, we use a simple quantization approach

  const gifData: number[] = [];

  // GIF Header
  writeString(gifData, 'GIF89a');

  // Logical Screen Descriptor
  writeUint16(gifData, width);
  writeUint16(gifData, height);
  gifData.push(0x70); // GCT flag=0, color res=7, sort=0, GCT size=0
  gifData.push(0); // bg color index
  gifData.push(0); // pixel aspect ratio

  // Netscape extension for looping
  gifData.push(0x21); // Extension
  gifData.push(0xff); // Application Extension
  gifData.push(11); // Block size
  writeString(gifData, 'NETSCAPE2.0');
  gifData.push(3); // Sub-block size
  gifData.push(1); // Loop indicator
  writeUint16(gifData, 0); // Loop count (0 = infinite)
  gifData.push(0); // Block terminator

  for (const frameCanvas of frames) {
    const ctx = frameCanvas.getContext('2d');
    if (!ctx) continue;

    const imageData = ctx.getImageData(0, 0, width, height);
    const { palette, indexedPixels } = quantize(imageData.data, width * height);

    // Graphic Control Extension
    gifData.push(0x21); // Extension
    gifData.push(0xf9); // GCE label
    gifData.push(4); // Block size
    gifData.push(0); // Disposal + flags
    writeUint16(gifData, delay);
    gifData.push(0); // Transparent color index
    gifData.push(0); // Block terminator

    // Image Descriptor
    gifData.push(0x2c); // Image separator
    writeUint16(gifData, 0); // Left
    writeUint16(gifData, 0); // Top
    writeUint16(gifData, width);
    writeUint16(gifData, height);
    gifData.push(0x87); // Local color table, 256 colors

    // Local Color Table (256 * 3 bytes)
    for (let i = 0; i < 256; i++) {
      gifData.push(palette[i * 3] ?? 0);
      gifData.push(palette[i * 3 + 1] ?? 0);
      gifData.push(palette[i * 3 + 2] ?? 0);
    }

    // LZW compressed image data
    const lzwMinCodeSize = 8;
    gifData.push(lzwMinCodeSize);
    const compressed = lzwEncode(indexedPixels, lzwMinCodeSize);

    // Write in sub-blocks (max 255 bytes each)
    let offset = 0;
    while (offset < compressed.length) {
      const chunkSize = Math.min(255, compressed.length - offset);
      gifData.push(chunkSize);
      for (let i = 0; i < chunkSize; i++) {
        gifData.push(compressed[offset + i]);
      }
      offset += chunkSize;
    }
    gifData.push(0); // Block terminator
  }

  // GIF Trailer
  gifData.push(0x3b);

  return new Blob([new Uint8Array(gifData)], { type: 'image/gif' });
}

// ── Helpers ──

function writeString(arr: number[], str: string) {
  for (let i = 0; i < str.length; i++) {
    arr.push(str.charCodeAt(i));
  }
}

function writeUint16(arr: number[], val: number) {
  arr.push(val & 0xff);
  arr.push((val >> 8) & 0xff);
}

/**
 * Simple median-cut color quantization to 256 colors.
 */
function quantize(
  rgba: Uint8ClampedArray,
  pixelCount: number,
): { palette: number[]; indexedPixels: number[] } {
  // Build a color frequency map (simplified — use 5-bit color)
  const colorMap = new Map<number, number>();

  for (let i = 0; i < pixelCount; i++) {
    const r = (rgba[i * 4] >> 3) << 3;
    const g = (rgba[i * 4 + 1] >> 3) << 3;
    const b = (rgba[i * 4 + 2] >> 3) << 3;
    const key = (r << 16) | (g << 8) | b;
    colorMap.set(key, (colorMap.get(key) ?? 0) + 1);
  }

  // Get top 256 colors by frequency
  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 256);

  const palette: number[] = [];
  const paletteMap = new Map<number, number>();

  sorted.forEach(([color], idx) => {
    palette.push((color >> 16) & 0xff); // R
    palette.push((color >> 8) & 0xff); // G
    palette.push(color & 0xff); // B
    paletteMap.set(color, idx);
  });

  // Pad palette to 256 entries
  while (palette.length < 256 * 3) {
    palette.push(0);
  }

  // Map pixels to palette indices
  const indexedPixels: number[] = [];
  for (let i = 0; i < pixelCount; i++) {
    const r = (rgba[i * 4] >> 3) << 3;
    const g = (rgba[i * 4 + 1] >> 3) << 3;
    const b = (rgba[i * 4 + 2] >> 3) << 3;
    const key = (r << 16) | (g << 8) | b;

    let idx = paletteMap.get(key);
    if (idx === undefined) {
      // Find nearest color
      idx = findNearest(palette, r, g, b);
    }
    indexedPixels.push(idx);
  }

  return { palette, indexedPixels };
}

function findNearest(palette: number[], r: number, g: number, b: number): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < 256; i++) {
    const dr = palette[i * 3] - r;
    const dg = palette[i * 3 + 1] - g;
    const db = palette[i * 3 + 2] - b;
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * LZW encoding for GIF.
 */
function lzwEncode(pixels: number[], minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const maxCode = 4096;

  const table = new Map<string, number>();
  // Initialize table
  for (let i = 0; i < clearCode; i++) {
    table.set(String(i), i);
  }

  const output: number[] = [];
  let bits = 0;
  let bitCount = 0;

  function writeBits(code: number, size: number) {
    bits |= code << bitCount;
    bitCount += size;
    while (bitCount >= 8) {
      output.push(bits & 0xff);
      bits >>= 8;
      bitCount -= 8;
    }
  }

  writeBits(clearCode, codeSize);

  let current = String(pixels[0]);

  for (let i = 1; i < pixels.length; i++) {
    const next = current + ',' + pixels[i];
    if (table.has(next)) {
      current = next;
    } else {
      writeBits(table.get(current)!, codeSize);

      if (nextCode < maxCode) {
        table.set(next, nextCode++);
        if (nextCode > 1 << codeSize && codeSize < 12) {
          codeSize++;
        }
      } else {
        // Table full — emit clear code and reset
        writeBits(clearCode, codeSize);
        table.clear();
        for (let j = 0; j < clearCode; j++) {
          table.set(String(j), j);
        }
        nextCode = eoiCode + 1;
        codeSize = minCodeSize + 1;
      }

      current = String(pixels[i]);
    }
  }

  writeBits(table.get(current)!, codeSize);
  writeBits(eoiCode, codeSize);

  // Flush remaining bits
  if (bitCount > 0) {
    output.push(bits & 0xff);
  }

  return output;
}
