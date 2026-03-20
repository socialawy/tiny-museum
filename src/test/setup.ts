import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// happy-dom doesn't implement Canvas 2D — mock it globally for tests

const mockCtx = {
    drawImage: () => { },
    fillRect: () => { },
    clearRect: () => { },
    scale: () => { },
    fillText: () => { },
    save: () => { },
    restore: () => { },
    getImageData: () => ({
        data: new Uint8ClampedArray(4),
    }),
    putImageData: () => { },
    fillStyle: '#000',
    strokeStyle: '#000',
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    filter: 'none',
    canvas: null as any,
};

HTMLCanvasElement.prototype.getContext = function (type: string) {
    if (type === '2d') {
        return { ...mockCtx, canvas: this } as any;
    }
    return null;
} as any;

HTMLCanvasElement.prototype.toBlob = function (
    cb: (blob: Blob | null) => void,
) {
    cb(new Blob(['mock-image'], { type: 'image/png' }));
} as any;

HTMLCanvasElement.prototype.toDataURL = function () {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualEQAAAABJRU5ErkJggg==';
} as any;