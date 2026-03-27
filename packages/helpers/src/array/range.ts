export const range = (start: number, end: number): number[] => [
  ..._range(start, end),
];

function* _range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

if (import.meta.vitest) {
  describe('range', () => {
    it('start以上end未満の配列を返す', () => {
      expect(range(2, 5)).toEqual([2, 3, 4]);
    });

    it('startとendが同じ場合は空配列を返す', () => {
      expect(range(3, 3)).toEqual([]);
    });

    it('startがendより大きい場合は空配列を返す', () => {
      expect(range(5, 3)).toEqual([]);
    });
  });
}
