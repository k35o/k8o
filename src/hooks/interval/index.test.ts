import { renderHook } from '@testing-library/react';
import { useInterval } from '.';

describe('useInterval', () => {
  it('指定時間ごとに実行される', () => {
    const fn = vi.fn();
    vi.useFakeTimers();

    renderHook(() => useInterval(fn, 1000));
    vi.advanceTimersByTime(2000);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('指定時間を過ぎないと実行されない', () => {
    const fn = vi.fn();
    vi.useFakeTimers();

    renderHook(() => useInterval(fn, 1000));
    vi.advanceTimersByTime(10);

    expect(fn).not.toHaveBeenCalled();
  });

  it('アンマウント後は実行されない', () => {
    const fn = vi.fn();
    vi.useFakeTimers();

    const { unmount } = renderHook(() => useInterval(fn, 1000));
    unmount();
    vi.advanceTimersByTime(2000);

    expect(fn).not.toHaveBeenCalled();
  });
});
