import type { Canvas } from 'fabric';

export class CanvasHistory {
  private states: string[] = [];
  private pointer = -1;
  private maxStates = 50;
  private locked = false;

  constructor(private canvas: Canvas) {
    this.capture();
  }

  capture(): void {
    if (this.locked) return;
    this.states = this.states.slice(0, this.pointer + 1);
    const json = JSON.stringify(this.canvas.toJSON());
    this.states.push(json);
    if (this.states.length > this.maxStates) {
      this.states.shift();
    }
    this.pointer = this.states.length - 1;
  }

  async undo(): Promise<boolean> {
    if (!this.canUndo) return false;
    this.pointer--;
    await this.restore();
    return true;
  }

  async redo(): Promise<boolean> {
    if (!this.canRedo) return false;
    this.pointer++;
    await this.restore();
    return true;
  }

  get canUndo(): boolean {
    return this.pointer > 0;
  }

  get canRedo(): boolean {
    return this.pointer < this.states.length - 1;
  }

  private async restore(): Promise<void> {
    this.locked = true;
    try {
      const state = JSON.parse(this.states[this.pointer]);
      await this.canvas.loadFromJSON(state);
      this.canvas.renderAll();
    } finally {
      this.locked = false;
    }
  }
}
