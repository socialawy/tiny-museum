import type { Canvas } from 'fabric';

interface GestureState {
    mode: 'draw' | 'pinch';
    lastPinchDist: number;
    lastPanPoint: { x: number; y: number } | null;
}

export function attachTouchGestures(canvas: Canvas): () => void {
    const el = canvas.upperCanvasEl;  // Fabric v6 uses upperCanvasEl
    const state: GestureState = {
        mode: 'draw',
        lastPinchDist: 0,
        lastPanPoint: null,
    };

    function getTouchDist(e: TouchEvent): number {
        const [a, b] = [e.touches[0], e.touches[1]];
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    function onTouchStart(e: TouchEvent) {
        if (e.touches.length === 2) {
            state.mode = 'pinch';
            state.lastPinchDist = getTouchDist(e);
            state.lastPanPoint = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
            };
            canvas.isDrawingMode = false;
            canvas.selection = false;
        }
    }

    function onTouchMove(e: TouchEvent) {
        if (state.mode !== 'pinch' || e.touches.length !== 2) return;
        e.preventDefault();

        const newDist = getTouchDist(e);
        const scale = newDist / state.lastPinchDist;
        const currentZoom = canvas.getZoom();
        const newZoom = Math.min(Math.max(currentZoom * scale, 0.5), 4);
        canvas.setZoom(newZoom);
        state.lastPinchDist = newDist;

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        if (state.lastPanPoint) {
            const vpt = canvas.viewportTransform;
            if (vpt) {
                vpt[4] += midX - state.lastPanPoint.x;
                vpt[5] += midY - state.lastPanPoint.y;
                canvas.requestRenderAll();
            }
        }
        state.lastPanPoint = { x: midX, y: midY };
    }

    function onTouchEnd(e: TouchEvent) {
        if (e.touches.length < 2) {
            state.mode = 'draw';
            canvas.isDrawingMode = true;
            canvas.selection = true;
        }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
    };
}