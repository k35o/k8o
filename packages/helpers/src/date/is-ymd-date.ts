// publishedAt / eventDate など、テキストで日付順に並べ替えるため YYYY-MM-DD 形式に限定する。
const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

export const isYmdDate = (value: string): boolean => YMD_PATTERN.test(value);

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('isYmdDate', () => {
    it('YYYY-MM-DD 形式を許可する', () => {
      expect(isYmdDate('2026-01-01')).toBe(true);
    });

    it('形式が異なる文字列を拒否する', () => {
      expect(isYmdDate('2026/01/01')).toBe(false);
      expect(isYmdDate('2026-1-1')).toBe(false);
      expect(isYmdDate('')).toBe(false);
    });
  });
}
