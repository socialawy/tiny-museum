import { describe, it, expect, vi } from 'vitest';
import { CanvasHistory } from '../history';

interface MockCanvasState {
  objects: unknown[];
  version: string;
}

function createMockCanvas() {
  let state: MockCanvasState = { objects: [], version: '6.0' };

  return {
    toJSON: () => JSON.parse(JSON.stringify(state)) as MockCanvasState,
    loadFromJSON: vi.fn(async (json: MockCanvasState) => {
      state = json;
    }),
    renderAll: vi.fn(),
  };
}

describe('CanvasHistory', () => {
  it('starts with one state (initial capture)', () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as unknown as Parameters<typeof CanvasHistory>[0]);

    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
  });

  it('tracks captures and allows undo', async () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as unknown as Parameters<typeof CanvasHistory>[0]);

    history.capture();
    history.capture();

    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);

    const undone = await history.undo();
    expect(undone).toBe(true);
    expect(history.canRedo).toBe(true);
    expect(canvas.loadFromJSON).toHaveBeenCalled();
  });

  it('supports redo after undo', async () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as unknown as Parameters<typeof CanvasHistory>[0]);

    history.capture();
    await history.undo();

    expect(history.canRedo).toBe(true);

    const redone = await history.redo();
    expect(redone).toBe(true);
    expect(history.canRedo).toBe(false);
  });

  it('clears forward history on new capture after undo', async () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as unknown as Parameters<typeof CanvasHistory>[0]);

    history.capture();
    history.capture();
    await history.undo();
    history.capture();

    expect(history.canRedo).toBe(false);
  });

  it('does not undo past initial state', async () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as unknown as Parameters<typeof CanvasHistory>[0]);

    const result = await history.undo();
    expect(result).toBe(false);
  });

  it('does not redo when at latest state', async () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as unknown as Parameters<typeof CanvasHistory>[0]);

    history.capture();
    const result = await history.redo();
    expect(result).toBe(false);
  });
});
