import { useHash } from '.';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

vi.mock('../client', () => ({
  useClient: () => true,
}));

describe('useHash', () => {
  const realHash = window.location.hash;
  beforeEach(() => {
    window.location.hash = '#test';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.location.hash = realHash;
  });

  it('現在のhash値を取得できる', () => {
    const { result } = renderHook(() => useHash());

    expect(result.current).toBe('test');
  });

  it('hash値が変更されたときに更新される', () => {
    const { result } = renderHook(() => useHash());

    window.location.hash = '#changed';
    act(() => {
      window.dispatchEvent(new Event('hashchange'));
    });

    expect(result.current).toBe('changed');
  });

  it('pushStateでhash値が変更されたときに更新される', async () => {
    const { result } = renderHook(() => useHash());

    act(() => {
      window.history.pushState({}, '', '/#pushed');
    });

    await waitFor(() => {
      expect(result.current).toBe('pushed');
    });
  });

  it('replaceStateでhash値が変更されたときに更新される', async () => {
    const { result } = renderHook(() => useHash());

    act(() => {
      window.history.replaceState({}, '', '/#replaced');
    });

    await waitFor(() => {
      expect(result.current).toBe('replaced');
    });
  });
});
