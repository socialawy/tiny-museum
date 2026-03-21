'use client';

import type { Canvas } from 'fabric';
import { BACKGROUNDS } from '@/lib/fabric/tools';
import { useSounds } from '@/hooks/useSounds';

interface BackgroundPickerProps {
  canvas: Canvas | null;
  onClose: () => void;
}

export function BackgroundPicker({ canvas, onClose }: BackgroundPickerProps) {
  const { playSound } = useSounds();

  function pickBackground(bg: (typeof BACKGROUNDS)[number]) {
    if (!canvas) return;

    if (bg.type === 'color') {
      canvas.backgroundColor = bg.value;
      canvas.renderAll();
    } else {
      // For textures, we'd ideally load an image, but for now we'll use a simple SVG pattern
      const patternUrl =
        bg.value === 'grid-texture'
          ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2RkZCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg=='
          : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGZpbHRlciBpZD0ibm9pc2UiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmVmNyIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=';

      const img = new Image();
      img.onload = () => {
        const fabricWindow = window as unknown as Record<string, unknown>;
        const PatternClass = (fabricWindow.fabric as Record<string, unknown>)
          .Pattern as unknown as new (options: Record<string, unknown>) => unknown;
        const pattern = new PatternClass({
          source: img,
          repeat: 'repeat',
        }) as unknown as string;
        canvas.backgroundColor = pattern;
        canvas.renderAll();
      };
      img.src = patternUrl;
    }
    playSound('colorPop');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-kid w-full max-w-md p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold">🎨 Background</h3>
          <button onClick={onClose} className="kid-button text-sm">
            Done ✓
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.name}
              onClick={() => pickBackground(bg)}
              className="flex flex-col items-center gap-2 p-3 rounded-kid
                         border-2 border-gray-200 active:scale-95
                         transition-transform"
            >
              <div
                className="w-14 h-14 rounded-lg border border-gray-300"
                style={
                  bg.type === 'color'
                    ? { backgroundColor: bg.value }
                    : {
                        backgroundImage: `url(${
                          bg.value === 'grid-texture'
                            ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2RkZCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg=='
                            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGZpbHRlciBpZD0ibm9pc2UiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmVmNyIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4='
                        })`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: bg.value === 'grid-texture' ? '20px' : 'auto',
                      }
                }
              />
              <span className="text-xs font-bold text-gray-600">{bg.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
