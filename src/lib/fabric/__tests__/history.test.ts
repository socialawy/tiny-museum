import { describe, it, expect, vi } from 'vitest';
import { CanvasHistory } from '../history';

function createMockCanvas() {
  let state = { objects: [] as any[], version: '6.0' };

  return {
    toJSON: () => JSON.parse(JSON.stringify(state)),
    loadFromJSON: vi.fn(async (json: any) => {
      state = json;
    }),
    renderAll: vi.fn(),
  };
}

describe('CanvasHistory', () => {
  it('starts with one state (initial capture)', () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as any);

    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
  });

  it('tracks captures and allows undo', async () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as any);

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
    const history = new CanvasHistory(canvas as any);

    history.capture();
    await history.undo();

    expect(history.canRedo).toBe(true);

    const redone = await history.redo();
    expect(redone).toBe(true);
    expect(history.canRedo).toBe(false);
  });

  it('clears forward history on new capture after undo', async () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as any);

    history.capture();
    history.capture();
    await history.undo();
    history.capture();

    expect(history.canRedo).toBe(false);
  });

  it('does not undo past initial state', async () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as any);

    const result = await history.undo();
    expect(result).toBe(false);
  });

  it('does not redo when at latest state', async () => {
    const canvas = createMockCanvas();
    const history = new CanvasHistory(canvas as any);

    history.capture();
    const result = await history.redo();
    expect(result).toBe(false);
  });
});
