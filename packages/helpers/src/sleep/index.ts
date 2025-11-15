export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

if (import.meta.vitest) {
  const { describe, expect, it, vi, beforeEach, afterEach } = import.meta
    .vitest;

  describe('sleep', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('正常な動作の場合', () => {
      it('指定されたミリ秒待機するべき', async () => {
        const promise = sleep(1000);
        vi.advanceTimersByTime(1000);
        await expect(promise).resolves.toBeUndefined();
      });

      it('0ミリ秒の場合は即座に解決されるべき', async () => {
        const promise = sleep(0);
        vi.advanceTimersByTime(0);
        await expect(promise).resolves.toBeUndefined();
      });
    });

    describe('エッジケースの場合', () => {
      it('大きな値でも正しく動作するべき', async () => {
        const promise = sleep(100000);
        vi.advanceTimersByTime(100000);
        await expect(promise).resolves.toBeUndefined();
      });
    });
  });
}
