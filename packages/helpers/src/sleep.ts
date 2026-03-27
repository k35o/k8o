export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

if (import.meta.vitest) {
  const { afterEach, describe, expect, it, vi } = import.meta.vitest;

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sleep', () => {
    it('指定した時間が経過した後にresolveする', async () => {
      vi.useFakeTimers();

      const callback = vi.fn();
      const promise = sleep(1000).then(callback);

      await vi.advanceTimersByTimeAsync(999);
      expect(callback).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      await promise;
      expect(callback).toHaveBeenCalledOnce();
    });
  });
}
