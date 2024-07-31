import { act, renderHook } from '@testing-library/react';
import { useClipboard } from '.';

const onOpenMockFn = vi.fn();

vi.mock('@/components/toast', () => ({
  useToast: () => ({
    onOpen: onOpenMockFn,
  }),
}));

describe('useClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('クリップボードを書き込める', async () => {
    const writeText = 'test';
    const writeTextMockFn = vi.fn();
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: writeTextMockFn,
      },
    });

    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.writeClipboard(writeText);
    });

    expect(onOpenMockFn).toBeCalledWith(
      'success',
      'クリップボードにコピーしました',
    );
    expect(onOpenMockFn).toHaveBeenCalledOnce();
    expect(writeTextMockFn).toBeCalledWith(writeText);
    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
  });

  it('クリップボードを読み込める', async () => {
    const readTextMockFn = vi.fn();
    vi.stubGlobal('navigator', {
      clipboard: {
        readText: readTextMockFn,
      },
    });

    const { result } = renderHook(() => useClipboard());
    act(async () => {
      await result.current.readClipboard();
    });

    expect(readTextMockFn).toHaveBeenCalledOnce();
  });
});
