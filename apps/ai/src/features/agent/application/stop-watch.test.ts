import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { touchRunHeartbeat } from '../infrastructure/thread-repository';
import { watchStopRequest } from './stop-watch';

vi.mock('server-only', () => ({}));
vi.mock('../infrastructure/thread-repository', () => ({
  touchRunHeartbeat: vi.fn(),
}));

const watch = (
  signal: AbortSignal = new AbortController().signal,
): { onStop: ReturnType<typeof vi.fn> } => {
  const onStop = vi.fn();
  watchStopRequest({ threadId: 't1', runId: 'run-1', signal, onStop });
  return { onStop };
};

beforeEach(() => {
  vi.useFakeTimers({ now: Date.parse('2026-10-14T12:00:00.000Z') });
  vi.mocked(touchRunHeartbeat).mockResolvedValue({ stopRequested: false });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('watchStopRequest', () => {
  describe('正常系', () => {
    it('2 秒ごとに、その時刻で生存の印を更新する', async () => {
      watch();

      await vi.advanceTimersByTimeAsync(4000);

      expect(vi.mocked(touchRunHeartbeat).mock.calls).toStrictEqual([
        [
          {
            threadId: 't1',
            runId: 'run-1',
            heartbeatAt: '2026-10-14T12:00:02.000Z',
          },
        ],
        [
          {
            threadId: 't1',
            runId: 'run-1',
            heartbeatAt: '2026-10-14T12:00:04.000Z',
          },
        ],
      ]);
    });

    it('停止が要求されたら onStop を一度だけ呼び、実行が終わるまで生存の印は更新し続ける', async () => {
      vi.mocked(touchRunHeartbeat).mockResolvedValue({ stopRequested: true });
      const { onStop } = watch();

      await vi.advanceTimersByTimeAsync(6000);

      expect(onStop).toHaveBeenCalledOnce();
      expect(touchRunHeartbeat).toHaveBeenCalledTimes(3);
    });

    it('signal を中断すると、それ以降は読まない', async () => {
      const controller = new AbortController();
      watch(controller.signal);
      await vi.advanceTimersByTimeAsync(2000);

      controller.abort();
      await vi.advanceTimersByTimeAsync(10_000);

      expect(touchRunHeartbeat).toHaveBeenCalledOnce();
    });
  });

  describe('異常系', () => {
    it('読み取りに失敗してもログを残して続ける', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(touchRunHeartbeat)
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValue({ stopRequested: true });
      const { onStop } = watch();

      await vi.advanceTimersByTimeAsync(4000);

      expect(error).toHaveBeenCalledOnce();
      expect(onStop).toHaveBeenCalledOnce();
    });

    it('印がほかの実行に移っていたら、それ以降は読まない', async () => {
      vi.mocked(touchRunHeartbeat).mockResolvedValue(null);
      watch();

      await vi.advanceTimersByTimeAsync(10_000);

      expect(touchRunHeartbeat).toHaveBeenCalledOnce();
    });
  });

  describe('エッジケース', () => {
    it('読み取りの途中で中断されたら、停止が要求されていても onStop を呼ばない', async () => {
      const controller = new AbortController();
      const read = Promise.withResolvers<{ stopRequested: boolean }>();
      vi.mocked(touchRunHeartbeat).mockReturnValue(read.promise);
      const { onStop } = watch(controller.signal);
      await vi.advanceTimersByTimeAsync(2000);

      controller.abort();
      read.resolve({ stopRequested: true });
      await vi.advanceTimersByTimeAsync(10_000);

      expect(onStop).not.toHaveBeenCalled();
      expect(touchRunHeartbeat).toHaveBeenCalledOnce();
    });

    it('始める前に中断済みなら、一度も読まない', async () => {
      const controller = new AbortController();
      controller.abort();
      watch(controller.signal);

      await vi.advanceTimersByTimeAsync(10_000);

      expect(touchRunHeartbeat).not.toHaveBeenCalled();
    });

    it('前の読み取りが終わるまで、次の読み取りを始めない', async () => {
      const read = Promise.withResolvers<{ stopRequested: boolean }>();
      vi.mocked(touchRunHeartbeat).mockReturnValueOnce(read.promise);
      watch();

      await vi.advanceTimersByTimeAsync(10_000);
      expect(touchRunHeartbeat).toHaveBeenCalledOnce();

      read.resolve({ stopRequested: false });
      await vi.advanceTimersByTimeAsync(2000);
      expect(touchRunHeartbeat).toHaveBeenCalledTimes(2);
    });
  });
});
