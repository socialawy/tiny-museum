/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

interface MockContext {
  drawImage: () => void;
  fillRect: () => void;
  clearRect: () => void;
  scale: () => void;
  fillText: () => void;
  save: () => void;
  restore: () => void;
  getImageData: () => { data: Uint8ClampedArray };
  putImageData: () => void;
  fillStyle: string;
  strokeStyle: string;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  filter: string;
  canvas: HTMLCanvasElement | null;
}

const mockCtx: MockContext = {
  drawImage: () => {},
  fillRect: () => {},
  clearRect: () => {},
  scale: () => {},
  fillText: () => {},
  save: () => {},
  restore: () => {},
  getImageData: () => ({
    data: new Uint8ClampedArray(4),
  }),
  putImageData: () => {},
  fillStyle: '#000',
  strokeStyle: '#000',
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  filter: 'none',
  canvas: null,
};

HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  type: string,
): any {
  if (type === '2d') {
    return { ...mockCtx, canvas: this } as unknown as CanvasRenderingContext2D;
  }
  return null;
};

HTMLCanvasElement.prototype.toBlob = function (cb: BlobCallback): void {
  cb(new Blob(['mock-image'], { type: 'image/png' }));
};

HTMLCanvasElement.prototype.toDataURL = function (): string {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualEQAAAABJRU5ErkJggg==';
};
