import { Canvas, PencilBrush } from 'fabric';

export interface TinyCanvasConfig {
  container: HTMLCanvasElement;
  width: number;
  height: number;
  background?: string;
}

export function createTinyCanvas(config: TinyCanvasConfig): Canvas {
  const canvas = new Canvas(config.container, {
    width: config.width,
    height: config.height,
    backgroundColor: config.background ?? '#FFFEF7',
    isDrawingMode: true,
    selection: true,
    preserveObjectStacking: true,
    enableRetinaScaling: true,
    allowTouchScrolling: false,
  });

  // Default: fat crayon feel
  const brush = new PencilBrush(canvas);
  brush.width = 10;
  brush.color = '#6C5CE7';
  brush.decimate = 2;
  canvas.freeDrawingBrush = brush;

  return canvas;
}

export function resizeTinyCanvas(canvas: Canvas, width: number, height: number): void {
  canvas.setDimensions({ width, height });
  canvas.renderAll();
}
