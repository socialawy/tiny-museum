import { Circle, Rect, Polygon, FabricImage } from 'fabric';
import type { Canvas } from 'fabric';

/**
 * Shared helper: adds an object, switches to select mode,
 * and makes the new object active so the user can immediately
 * move/resize it.
 */
function addAndSelect(canvas: Canvas, obj: any) {
  canvas.isDrawingMode = false;
  canvas.selection = true;
  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.requestRenderAll();
}

export function addCircle(canvas: Canvas, color: string) {
  const circle = new Circle({
    radius: 50,
    fill: color,
    left: canvas.getWidth() / 2 - 50,
    top: canvas.getHeight() / 2 - 50,
    strokeWidth: 2,
    stroke: '#2D3436',
  });
  addAndSelect(canvas, circle);
}

export function addSquare(canvas: Canvas, color: string) {
  const rect = new Rect({
    width: 100,
    height: 100,
    fill: color,
    left: canvas.getWidth() / 2 - 50,
    top: canvas.getHeight() / 2 - 50,
    strokeWidth: 2,
    stroke: '#2D3436',
    rx: 8,
    ry: 8,
  });
  addAndSelect(canvas, rect);
}

export function addStar(canvas: Canvas, color: string) {
  const cx = 50,
    cy = 50,
    outerR = 50,
    innerR = 22;
  const points = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }

  const star = new Polygon(points, {
    fill: color,
    left: canvas.getWidth() / 2 - 50,
    top: canvas.getHeight() / 2 - 50,
    strokeWidth: 2,
    stroke: '#2D3436',
  });
  addAndSelect(canvas, star);
}

export function addHeart(canvas: Canvas, color: string) {
  const scale = 0.12;
  const heartPath = [
    { x: 300 * scale, y: 540 * scale },
    { x: 120 * scale, y: 396 * scale },
    { x: 60 * scale, y: 264 * scale },
    { x: 60 * scale, y: 180 * scale },
    { x: 120 * scale, y: 96 * scale },
    { x: 210 * scale, y: 84 * scale },
    { x: 300 * scale, y: 156 * scale },
    { x: 390 * scale, y: 84 * scale },
    { x: 480 * scale, y: 96 * scale },
    { x: 540 * scale, y: 180 * scale },
    { x: 540 * scale, y: 264 * scale },
    { x: 480 * scale, y: 396 * scale },
  ];

  const heart = new Polygon(heartPath, {
    fill: color,
    left: canvas.getWidth() / 2 - 35,
    top: canvas.getHeight() / 2 - 35,
    strokeWidth: 2,
    stroke: '#2D3436',
  });
  addAndSelect(canvas, heart);
}

export async function addImageToCanvas(
  canvas: Canvas,
  imageUrl: string,
  maxSize: number = 300,
): Promise<void> {
  const img = await FabricImage.fromURL(imageUrl, {
    crossOrigin: 'anonymous',
  });

  const scale = Math.min(
    maxSize / (img.width ?? maxSize),
    maxSize / (img.height ?? maxSize),
    1,
  );
  img.scaleX = scale;
  img.scaleY = scale;
  img.left = (canvas.getWidth() - (img.width ?? 0) * scale) / 2;
  img.top = (canvas.getHeight() - (img.height ?? 0) * scale) / 2;

  addAndSelect(canvas, img);
}