export const BRUSHES = {
  crayon: { type: 'pencil' as const, width: 10, opacity: 0.85 },
  marker: { type: 'pencil' as const, width: 16, opacity: 0.7 },
  pencil: { type: 'pencil' as const, width: 3, opacity: 1.0 },
  spray: { type: 'spray' as const, width: 25, opacity: 0.6 },
  eraser: { type: 'eraser' as const, width: 20, opacity: 1.0 },
} as const;

export type BrushKey = keyof typeof BRUSHES;

export const KID_PALETTE = [
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
] as const;

export const BACKGROUNDS = [
  { name: 'Paper', value: '#FFFEF7' },
  { name: 'Sky Blue', value: '#E8F4FD' },
  { name: 'Mint', value: '#E8FFF5' },
  { name: 'Lavender', value: '#F0E8FF' },
  { name: 'Sunset', value: '#FFF0E8' },
  { name: 'Dark', value: '#2D3436' },
] as const;
