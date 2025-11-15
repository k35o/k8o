export const range = (start: number, end: number): number[] => [
  ..._range(start, end),
];

function* _range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('range', () => {
    describe('正常な入力の場合', () => {
      it('基本的な範囲の配列を生成できるべき', () => {
        expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
      });

      it('開始値が0でない範囲を生成できるべき', () => {
        expect(range(5, 10)).toEqual([5, 6, 7, 8, 9]);
      });

      it('1要素のみの範囲を生成できるべき', () => {
        expect(range(0, 1)).toEqual([0]);
      });

      it('負の数を含む範囲を生成できるべき', () => {
        expect(range(-3, 2)).toEqual([-3, -2, -1, 0, 1]);
      });
    });

    describe('異常な入力の場合', () => {
      it('開始値と終了値が同じ場合は空配列を返すべき', () => {
        expect(range(5, 5)).toEqual([]);
      });

      it('開始値が終了値より大きい場合は空配列を返すべき', () => {
        expect(range(10, 5)).toEqual([]);
      });
    });

    describe('エッジケースの場合', () => {
      it('0から0の場合は空配列を返すべき', () => {
        expect(range(0, 0)).toEqual([]);
      });

      it('大きな範囲でも正しく動作するべき', () => {
        const result = range(0, 1000);
        expect(result).toHaveLength(1000);
        expect(result[0]).toBe(0);
        expect(result[999]).toBe(999);
      });
    });
  });
}
