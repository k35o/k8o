import { renderHook } from '@testing-library/react';
import { useTimeout } from '.';

describe('useTimeout', () => {
  it('指定時間後に実行される', () => {
    const fn = vi.fn();
    vi.useFakeTimers();

    renderHook(() => {
      useTimeout(fn, 1000);
    });
    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledOnce();
  });

  it('指定時間前に実行されない', () => {
    const fn = vi.fn();
    vi.useFakeTimers();

    renderHook(() => {
      useTimeout(fn, 1000);
    });
    vi.advanceTimersByTime(10);

    expect(fn).not.toHaveBeenCalled();
  });

  it('指定時間前にアンマウントされない場合は実行されない', () => {
    const fn = vi.fn();
    vi.useFakeTimers();

    const { unmount } = renderHook(() => {
      useTimeout(fn, 1000);
    });
    unmount();

    expect(fn).not.toHaveBeenCalled();
  });
});
