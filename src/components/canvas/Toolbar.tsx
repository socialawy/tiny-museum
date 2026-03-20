'use client';

import { useState } from 'react';
import { PencilBrush, SprayBrush } from 'fabric';
import type { Canvas } from 'fabric';
import { BRUSHES, KID_PALETTE, type BrushKey } from '@/lib/fabric/tools';
import { BigButton } from '@/components/ui/BigButton';
import { useSounds } from '@/hooks/useSounds';

interface ToolbarProps {
    canvas: Canvas | null;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onSave: () => void;
    onSendToGallery: () => void;
}

const TOOL_ICONS: Record<string, { emoji: string; label: string }> = {
    crayon: { emoji: '🖍️', label: 'Crayon' },
    pencil: { emoji: '✏️', label: 'Pencil' },
    marker: { emoji: '🖌️', label: 'Marker' },
    spray: { emoji: '💨', label: 'Spray' },
    eraser: { emoji: '🧹', label: 'Eraser' },
};

export function Toolbar({
    canvas,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onSave,
    onSendToGallery,
}: ToolbarProps) {
    const [activeTool, setActiveTool] = useState<BrushKey>('crayon');
    const [activeColor, setActiveColor] = useState<string>(KID_PALETTE[0]);
    const [brushSize, setBrushSize] = useState<number>(10);
    const { playSound } = useSounds();

    function selectTool(toolKey: BrushKey) {
        if (!canvas) return;
        const tool = BRUSHES[toolKey];
        setActiveTool(toolKey);
        setBrushSize(tool.width);
        playSound('toolSwitch');

        canvas.isDrawingMode = true;

        if (toolKey === 'eraser') {
            // Simple eraser: draw with background color
            const brush = new PencilBrush(canvas);
            brush.width = tool.width;
            brush.color = (canvas.backgroundColor as string) ?? '#FFFEF7';
            canvas.freeDrawingBrush = brush;
        } else if (tool.type === 'spray') {
            const brush = new SprayBrush(canvas);
            brush.width = tool.width;
            brush.color = activeColor;
            canvas.freeDrawingBrush = brush;
        } else {
            const brush = new PencilBrush(canvas);
            brush.width = tool.width;
            brush.color = activeColor;
            brush.decimate = 2;
            canvas.freeDrawingBrush = brush;
        }
    }

    function selectColor(color: string) {
        if (!canvas) return;
        setActiveColor(color);
        canvas.freeDrawingBrush.color = color;
        playSound('colorPop');
    }

    function changeBrushSize(newSize: number) {
        if (!canvas) return;
        setBrushSize(newSize);
        canvas.freeDrawingBrush.width = newSize;
    }

    return (
        <div className="flex flex-col w-full pointer-events-auto">
            {/* ── Top Bar: Undo/Redo + Actions ── */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/90 backdrop-blur-sm border-b-2 border-gray-100">
                <div className="flex gap-2">
                    <BigButton onClick={onUndo} disabled={!canUndo} aria-label="Undo">
                        ↩️
                    </BigButton>
                    <BigButton onClick={onRedo} disabled={!canRedo} aria-label="Redo">
                        ↪️
                    </BigButton>
                </div>
                <div className="flex gap-2">
                    <BigButton onClick={onSave} aria-label="Save">
                        💾
                    </BigButton>
                    <BigButton onClick={onSendToGallery} aria-label="Send to Gallery">
                        🏛️
                    </BigButton>
                </div>
            </div>

            {/* ── Bottom: Tools + Colors ── */}
            <div className="bg-white/95 backdrop-blur-sm border-t-2 border-gray-100">
                {/* Tool belt */}
                <div className="flex items-center justify-center gap-2 px-3 py-2">
                    {(Object.entries(TOOL_ICONS) as [BrushKey, typeof TOOL_ICONS[string]][]).map(
                        ([key, { emoji, label }]) => (
                            <BigButton
                                key={key}
                                onClick={() => selectTool(key)}
                                active={activeTool === key}
                                aria-label={label}
                            >
                                {emoji}
                            </BigButton>
                        )
                    )}
                </div>

                {/* Brush size slider */}
                <div className="flex items-center gap-3 px-6 pb-1">
                    <span className="text-xs">thin</span>
                    <input
                        type="range"
                        min={1}
                        max={40}
                        value={brushSize}
                        onChange={(e) => changeBrushSize(Number(e.target.value))}
                        className="flex-1 h-8 accent-kid-purple"
                        aria-label="Brush size"
                    />
                    <span className="text-xs">thick</span>
                </div>

                {/* Color strip */}
                <div
                    className="flex items-center gap-2 px-3 pb-3 overflow-x-auto"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {KID_PALETTE.map((color) => (
                        <button
                            key={color}
                            onClick={() => selectColor(color)}
                            aria-label={`Color ${color}`}
                            className="flex-shrink-0 rounded-full transition-transform duration-100"
                            style={{
                                backgroundColor: color,
                                width: 40,
                                height: 40,
                                border:
                                    activeColor === color
                                        ? '3px solid #2D3436'
                                        : '2px solid #E0E0E0',
                                transform:
                                    activeColor === color ? 'scale(1.25)' : 'scale(1)',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}