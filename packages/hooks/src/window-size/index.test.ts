import { useWindowSize } from '.';
import { renderHook, act } from '@testing-library/react';

describe('useWindowSize', () => {
  it('windowサイズの変更に合わせて現在のwindowサイズを取得する', () => {
    const initWindowSize = { width: 0, height: 0 };
    const resizedWindowSize = { width: 1000, height: 1000 };

    window.innerWidth = initWindowSize.width;
    window.innerHeight = initWindowSize.height;

    const { result } = renderHook(() => useWindowSize());

    expect(result.current).toEqual(initWindowSize);

    window.innerWidth = resizedWindowSize.width;
    window.innerHeight = resizedWindowSize.height;

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toEqual(resizedWindowSize);
  });
});
