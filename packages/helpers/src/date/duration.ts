// reading-list の記事取得・同期で共有する「直近90日」ウィンドウ（ミリ秒）。
// main / admin で同じ値を使うため一本化する。
export const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('NINETY_DAYS_MS', () => {
    it('90日をミリ秒で表す', () => {
      expect(NINETY_DAYS_MS).toBe(7_776_000_000);
    });
  });
}
