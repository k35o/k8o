import { act, renderHook } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import { useStep } from '.';

describe('useStep', () => {
  it('初期状態', () => {
    const initialCount = 1;
    const maxCount = 10;

    const { result } = renderHook(() => useStep({ initialCount, maxCount }));

    expect(result.current.count).toBe(initialCount);
    expect(result.current.isDisabledBack).toBeTruthy();
    expect(result.current.isDisabledNext).toBeFalsy();
  });
  it('nextでinitialCountから1進む', () => {
    const initialCount = 1;
    const maxCount = 10;

    const { result } = renderHook(() => useStep({ initialCount, maxCount }));
    act(() => {
      result.current.next();
    });

    expect(result.current.count).toBe(initialCount + 1);
    expect(result.current.isDisabledBack).toBeFalsy();
    expect(result.current.isDisabledNext).toBeFalsy();
  });
  it('initialCountからはbackできない', () => {
    const initialCount = 1;
    const maxCount = 10;

    const { result } = renderHook(() => useStep({ initialCount, maxCount }));
    act(() => {
      result.current.back();
    });

    expect(result.current.count).toBe(initialCount);
    expect(result.current.isDisabledBack).toBeTruthy();
    expect(result.current.isDisabledNext).toBeFalsy();
  });
  it('maxCountまで進む', () => {
    const initialCount = 1;
    const maxCount = 3;

    const { result } = renderHook(() => useStep({ initialCount, maxCount }));
    act(() => {
      result.current.next();
      result.current.next();
    });

    expect(result.current.count).toBe(maxCount);
    expect(result.current.isDisabledBack).toBeFalsy();
    expect(result.current.isDisabledNext).toBeTruthy();
  });
  it('maxCount以上は進めない', () => {
    const initialCount = 1;
    const maxCount = 3;

    const { result } = renderHook(() => useStep({ initialCount, maxCount }));
    act(() => {
      result.current.next();
      result.current.next();
      result.current.next();
    });

    expect(result.current.count).toBe(maxCount);
    expect(result.current.isDisabledBack).toBeFalsy();
    expect(result.current.isDisabledNext).toBeTruthy();
  });
  it('nextとbackを組み合わせて利用できる', () => {
    const initialCount = 1;
    const maxCount = 3;

    const { result } = renderHook(() => useStep({ initialCount, maxCount }));
    act(() => {
      result.current.next();
      result.current.back();
    });

    expect(result.current.count).toBe(initialCount);
    expect(result.current.isDisabledBack).toBeTruthy();
    expect(result.current.isDisabledNext).toBeFalsy();
  });
  it('左右キーで操作できる', async () => {
    const initialCount = 1;
    const maxCount = 3;

    const { result } = renderHook(() => useStep({ initialCount, maxCount }));

    await act(async () => {
      await userEvent.keyboard('{arrowright}');
    });
    expect(result.current.count).toBe(initialCount + 1);

    await act(async () => {
      await userEvent.keyboard('{arrowleft}');
    });
    expect(result.current.count).toBe(initialCount);
  });
});
