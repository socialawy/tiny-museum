import { FabricImage } from 'fabric';
import type { Canvas } from 'fabric';

/**
 * Renders an emoji to a canvas element, then adds it as a Fabric image.
 * This bypasses the SVG <text> rendering issue in Fabric.js.
 */
export async function addStickerToCanvas(
  canvas: Canvas,
  emoji: string,
  size: number = 80,
): Promise<void> {
  // Render emoji to an offscreen canvas
  const offscreen = document.createElement('canvas');
  const renderSize = size * 2; // 2x for retina quality
  offscreen.width = renderSize;
  offscreen.height = renderSize;

  const ctx = offscreen.getContext('2d')!;
  ctx.clearRect(0, 0, renderSize, renderSize);
  ctx.font = `${renderSize * 0.8}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, renderSize / 2, renderSize / 2);

  // Convert to data URL
  const dataUrl = offscreen.toDataURL('image/png');

  // Create Fabric image
  const img = await FabricImage.fromURL(dataUrl);

  // Scale down to target size
  img.scaleX = size / renderSize;
  img.scaleY = size / renderSize;

  // Center on canvas
  img.left = (canvas.getWidth() - size) / 2;
  img.top = (canvas.getHeight() - size) / 2;

  // Switch to select mode so user can position it
  canvas.isDrawingMode = false;
  canvas.selection = true;
  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();
}
