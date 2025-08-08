export const between = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

if (import.meta.vitest) {
  describe('between', () => {
    it('minとmaxの間の値の場合はそのまま返す', () => {
      expect(between(5, 0, 10)).toBe(5);
    });

    it('minより小さい場合はminを返す', () => {
      expect(between(-5, 0, 10)).toBe(0);
    });

    it('maxより大きい場合はmaxを返す', () => {
      expect(between(15, 0, 10)).toBe(10);
    });
  });
}
