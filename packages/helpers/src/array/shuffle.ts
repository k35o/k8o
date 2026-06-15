export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = temp as T;
  }
  return shuffled;
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('shuffle', () => {
    it('元の要素をすべて保持する', () => {
      const input = [1, 2, 3, 4, 5];
      expect([...shuffle(input)].toSorted((a, b) => a - b)).toEqual(input);
    });

    it('元の配列を破壊しない', () => {
      const input = [1, 2, 3];
      shuffle(input);
      expect(input).toEqual([1, 2, 3]);
    });

    it('空配列はそのまま空配列を返す', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('要素が1つの場合はその要素を返す', () => {
      expect(shuffle([42])).toEqual([42]);
    });
  });
}
