// Invalid Date は getTime() が NaN になり大小比較が全て false → 'equal' と
// 誤判定されるため、暗黙に握りつぶさず例外にする（呼び出し側で事前検証する前提）
export const compareDate = (
  date1: Date,
  date2: Date,
): 'less' | 'equal' | 'greater' => {
  if (Number.isNaN(date1.getTime()) || Number.isNaN(date2.getTime())) {
    throw new TypeError('Invalid Date は比較できません');
  }
  const compare = date1.getTime() - date2.getTime();
  if (compare < 0) {
    return 'less';
  }
  if (compare > 0) {
    return 'greater';
  }
  return 'equal';
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('compareDate', () => {
    describe('正常系', () => {
      it.each([
        ['2022-01-01T00:00:00Z', '2022-01-02T00:00:00Z', 'less'],
        ['2022-01-02T00:00:00Z', '2022-01-01T00:00:00Z', 'greater'],
        ['2022-01-01T00:00:00Z', '2022-01-01T00:00:00Z', 'equal'],
      ])('日付を比較する(%s)', (date1, date2, expected) => {
        expect(compareDate(new Date(date1), new Date(date2))).toBe(expected);
      });
    });

    describe('異常系', () => {
      it('date1 が Invalid Date なら例外を投げる', () => {
        expect(() =>
          compareDate(new Date('not a date'), new Date('2022-01-01T00:00:00Z')),
        ).toThrow(TypeError);
      });

      it('date2 が Invalid Date なら例外を投げる', () => {
        expect(() =>
          compareDate(new Date('2022-01-01T00:00:00Z'), new Date(Number.NaN)),
        ).toThrow(TypeError);
      });
    });
  });
}
