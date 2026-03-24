import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVisualViewport } from '../useVisualViewport';

describe('useVisualViewport', () => {
  let originalVisualViewport: VisualViewport | null;
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    originalVisualViewport = window.visualViewport;
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;

    // Mock window properties
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    // Mock visualViewport
    Object.defineProperty(window, 'visualViewport', {
      value: {
        width: 1024,
        height: 768,
        offsetTop: 0,
        offsetLeft: 0,
        scale: 1,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'visualViewport', {
      value: originalVisualViewport,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerWidth', {
      value: originalInnerWidth,
      writable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: originalInnerHeight,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('returns initial viewport dimensions', () => {
    const { result } = renderHook(() => useVisualViewport());

    expect(result.current).toEqual({
      width: 1024,
      height: 768,
      offsetTop: 0,
      offsetLeft: 0,
      scale: 1,
    });
  });

  it('updates dimensions when visualViewport resizes', () => {
    let resizeCallback: (() => void) | undefined;

    window.visualViewport!.addEventListener = vi
      .fn()
      .mockImplementation((event: string, cb: () => void) => {
        if (event === 'resize') resizeCallback = cb;
      });

    const { result } = renderHook(() => useVisualViewport());

    act(() => {
      // Simulate keyboard opening (height decreases)
      Object.assign(window.visualViewport!, {
        height: 400,
      });
      if (resizeCallback) resizeCallback();
    });

    expect(result.current.height).toBe(400);
  });

  it('updates dimensions when visualViewport scrolls', () => {
    let scrollCallback: (() => void) | undefined;

    window.visualViewport!.addEventListener = vi
      .fn()
      .mockImplementation((event: string, cb: () => void) => {
        if (event === 'scroll') scrollCallback = cb;
      });

    const { result } = renderHook(() => useVisualViewport());

    act(() => {
      Object.assign(window.visualViewport!, {
        offsetTop: 50,
      });
      if (scrollCallback) scrollCallback();
    });

    expect(result.current.offsetTop).toBe(50);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useVisualViewport());

    unmount();

    expect(window.visualViewport!.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
    expect(window.visualViewport!.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );
  });

  it('handles environment without visualViewport gracefully', () => {
    Object.defineProperty(window, 'visualViewport', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useVisualViewport());

    expect(result.current).toEqual({
      width: 1024,
      height: 768,
      offsetTop: 0,
      offsetLeft: 0,
      scale: 1,
    });
  });
});
