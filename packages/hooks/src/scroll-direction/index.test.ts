import { useScrollDirection } from '.';
import { renderHook, act } from '@testing-library/react';

describe('useScrollDirection', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      value: 0,
    });
  });

  it('初期状態ではx: right, y: upを返す', () => {
    const { result } = renderHook(() => useScrollDirection());

    expect(result.current).toEqual({ x: 'right', y: 'up' });
  });

  describe('Vertical scroll', () => {
    it('100px以上下にスクロールするとy: downを返す', () => {
      const { result } = renderHook(() => useScrollDirection());

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 150 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('down');
    });

    it('100px未満のスクロールではy: upのまま', () => {
      const { result } = renderHook(() => useScrollDirection());

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 50 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('up');
    });

    it('上にスクロールするとy: upを返す', () => {
      const { result } = renderHook(() => useScrollDirection());

      // 最初に下にスクロール
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 200 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('down');

      // 上にスクロール
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 100 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('up');
    });
  });

  describe('Horizontal scroll', () => {
    it('100px以上右にスクロールするとx: rightを返す', () => {
      const { result } = renderHook(() => useScrollDirection());

      act(() => {
        Object.defineProperty(window, 'scrollX', { value: 150 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.x).toBe('right');
    });

    it('100px未満のスクロールではx: rightのまま', () => {
      const { result } = renderHook(() => useScrollDirection());

      act(() => {
        Object.defineProperty(window, 'scrollX', { value: 50 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.x).toBe('right');
    });

    it('左にスクロールするとx: leftを返す', () => {
      const { result } = renderHook(() => useScrollDirection());

      // 最初に右にスクロール
      act(() => {
        Object.defineProperty(window, 'scrollX', { value: 200 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.x).toBe('right');

      // 左にスクロール
      act(() => {
        Object.defineProperty(window, 'scrollX', { value: 100 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.x).toBe('left');
    });
  });

  describe('Combined scroll', () => {
    it('縦横同時にスクロールした場合、両方向を正しく検知する', () => {
      const { result } = renderHook(() => useScrollDirection());

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 150 });
        Object.defineProperty(window, 'scrollX', { value: 150 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).toEqual({ x: 'right', y: 'down' });
    });
  });

  it('アンマウント後はイベントリスナーが削除される', () => {
    const removeEventListenerSpy = vi.spyOn(
      window,
      'removeEventListener',
    );

    const { unmount } = renderHook(() => useScrollDirection());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );
  });

  it('スクロールイベントがpassive: trueで登録される', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useScrollDirection());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true },
    );
  });

  describe('Threshold parameter', () => {
    it('thresholdが100の場合、100px以下のスクロールでは方向が変わらない', () => {
      const { result } = renderHook(() => useScrollDirection(100));

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 100 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('up');

      act(() => {
        Object.defineProperty(window, 'scrollX', { value: 100 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.x).toBe('right');
    });

    it('thresholdが100の場合、101px以上のスクロールで方向が変わる', () => {
      const { result } = renderHook(() => useScrollDirection(100));

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 101 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('down');

      act(() => {
        Object.defineProperty(window, 'scrollX', { value: 101 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.x).toBe('right');
    });

    it('thresholdが10の場合、10px以下のスクロールでは方向が変わらない', () => {
      const { result } = renderHook(() => useScrollDirection(10));

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 10 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('up');
    });

    it('thresholdが10の場合、11px以上のスクロールで方向が変わる', () => {
      const { result } = renderHook(() => useScrollDirection(10));

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 11 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('down');
    });

    it('thresholdが0の場合、1px以上のスクロールで方向が変わる', () => {
      const { result } = renderHook(() => useScrollDirection(0));

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 1 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('down');
    });

    it('デフォルト値（threshold未指定）では50pxの閾値が適用される', () => {
      const { result } = renderHook(() => useScrollDirection());

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 50 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('up');

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 51 });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.y).toBe('down');
    });
  });
});
