import { Canvas, PencilBrush, config as fabricConfig } from 'fabric';

// Disable Fabric's internal blob caching — forces data URL sources
fabricConfig.dynamicSVGImport = false;

export interface TinyCanvasConfig {
  container: HTMLCanvasElement;
  width: number;
  height: number;
  background?: string;
}

export function createTinyCanvas(cfg: TinyCanvasConfig): Canvas {
  const canvas = new Canvas(cfg.container, {
    width: cfg.width,
    height: cfg.height,
    backgroundColor: cfg.background ?? '#FFFEF7',
    isDrawingMode: true,
    selection: true,
    preserveObjectStacking: true,
    enableRetinaScaling: true,
    allowTouchScrolling: false,
    renderOnAddRemove: false,
  });

  const brush = new PencilBrush(canvas);
  brush.width = 10;
  brush.color = '#6C5CE7';
  brush.decimate = 2;
  canvas.freeDrawingBrush = brush;

  canvas.requestRenderAll();
  return canvas;
}

export function resizeTinyCanvas(
  canvas: Canvas,
  width: number,
  height: number,
): void {
  requestAnimationFrame(() => {
    canvas.setDimensions({ width, height });
    canvas.requestRenderAll();
  });
}