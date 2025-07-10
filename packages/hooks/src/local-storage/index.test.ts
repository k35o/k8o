import { useLocalStorage } from './index';
import { renderHook, act } from '@testing-library/react';

const consoleErrorMock = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

describe('useLocalStorage', () => {
  const key = 'testKey';

  beforeEach(() => {
    localStorage.clear();
  });

  afterAll(() => {
    consoleErrorMock.mockReset();
  });

  it('localStorageに値がなければ初期値を返す', () => {
    const { result } = renderHook(() =>
      useLocalStorage(key, 'defaultValue'),
    );

    expect(result.current[0]).toBe('defaultValue');
  });

  it('localStorageに値が存在あればその値を返す', () => {
    localStorage.setItem(key, JSON.stringify('storedValue'));
    const { result } = renderHook(() =>
      useLocalStorage(key, 'defaultValue'),
    );

    expect(result.current[0]).toBe('storedValue');
  });

  it('更新処理ではlocalStorageとstateの両方を更新する', () => {
    const { result } = renderHook(() =>
      useLocalStorage(key, 'defaultValue'),
    );

    act(() => {
      result.current[1]('newValue');
    });

    expect(localStorage.getItem(key)).toBe(
      JSON.stringify('newValue'),
    );
    expect(result.current[0]).toBe('newValue');
  });

  it('削除処理ではlocalStorageは値を削除され、stateは初期値になる', () => {
    localStorage.setItem(key, JSON.stringify('storedValue'));
    const { result } = renderHook(() =>
      useLocalStorage(key, 'defaultValue'),
    );

    act(() => {
      result.current[2]();
    });

    expect(localStorage.getItem(key)).toBeNull();
    expect(result.current[0]).toBe('defaultValue');
  });

  it('nullで更新した場合はremoveと同じ結果になる', () => {
    const { result } = renderHook(() =>
      useLocalStorage<{ lang: string[] } | null>(key, {
        lang: ['ja', 'en'],
      }),
    );

    act(() => {
      result.current[1](null);
    });

    expect(localStorage.getItem(key)).toBeNull();
    expect(result.current[0]).toEqual({ lang: ['ja', 'en'] });
  });

  it('storageイベントの発火に応じて状stateが更新される', () => {
    const { result } = renderHook(() =>
      useLocalStorage(key, 'defaultValue'),
    );

    act(() => {
      localStorage.setItem(key, JSON.stringify('updatedValue'));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: JSON.stringify('updatedValue'),
        }),
      );
    });

    expect(result.current[0]).toBe('updatedValue');
  });

  it('異なるキーのstorageイベントはstateを更新しない', () => {
    const { result } = renderHook(() =>
      useLocalStorage(key, 'defaultValue'),
    );

    act(() => {
      localStorage.setItem('otherKey', JSON.stringify('otherValue'));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'otherKey',
          newValue: JSON.stringify('otherValue'),
        }),
      );
    });

    expect(result.current[0]).toBe('defaultValue');
  });

  it('JSONをパースできない時はエラーを吐いて初期値を返す', () => {
    localStorage.setItem(key, '{invalidJSON');
    const { result } = renderHook(() =>
      useLocalStorage(key, 'defaultValue'),
    );

    expect(result.current[0]).toBe('defaultValue');
    expect(consoleErrorMock).toHaveBeenCalledOnce();
  });
});
