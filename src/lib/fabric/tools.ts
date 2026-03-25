export const BRUSHES = {
  crayon: { type: 'pencil' as const, width: 10, opacity: 0.85 },
  marker: { type: 'pencil' as const, width: 16, opacity: 0.7 },
  pencil: { type: 'pencil' as const, width: 3, opacity: 1.0 },
  spray: { type: 'spray' as const, width: 25, opacity: 0.6 },
  eraser: { type: 'eraser' as const, width: 20, opacity: 1.0 },
} as const;

export type BrushKey = keyof typeof BRUSHES;

export const KID_PALETTE = [
  // Row 1 — bold primaries + favorites
  '#FF6B6B',
  '#FF8E53',
  '#FECA57',
  '#48DBFB',
  '#6C5CE7',
  '#A29BFE',
  '#FD79A8',
  '#00B894',
  '#2D3436',
  '#FDFDFD',
  '#E17055',
  '#81ECEC',
  // Row 2 — expanded range (#16)
  '#D63031',
  '#E84393',
  '#0984E3',
  '#00CEC9',
  '#6AB04C',
  '#F9CA24',
  '#F0932B',
  '#EB4D4B',
  '#7ED6DF',
  '#C4E538',
  '#9B59B6',
  '#BDC3C7',
] as const;

export const BACKGROUNDS = [
  { name: 'Paper', value: '#FFFEF7', type: 'color' },
  { name: 'Sky Blue', value: '#E8F4FD', type: 'color' },
  { name: 'Mint', value: '#E8FFF5', type: 'color' },
  { name: 'Lavender', value: '#F0E8FF', type: 'color' },
  { name: 'Sunset', value: '#FFF0E8', type: 'color' },
  { name: 'Dark', value: '#2D3436', type: 'color' },
  { name: 'Canvas', value: 'canvas-texture', type: 'texture' },
  { name: 'Grid', value: 'grid-texture', type: 'texture' },
] as const;
