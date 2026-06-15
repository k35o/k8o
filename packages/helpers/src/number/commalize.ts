export const commalize = (num: number) => {
  const roundedNumber = Math.round(num);
  const numberString = roundedNumber.toString();

  return numberString.replaceAll(/\B(?=(\d{3})+(?!\d))/gu, ',');
};

if (import.meta.vitest) {
  it('3桁未満の場合はそのまま返す', () => {
    expect(commalize(100)).toBe('100');
  });

  it('4桁の場合はカンマ区切りにする', () => {
    expect(commalize(1000)).toBe('1,000');
  });

  it('3桁毎にカンマ区切りにする', () => {
    expect(commalize(1_000_000)).toBe('1,000,000');
  });

  it('小数の場合は四捨五入して整数にする', () => {
    expect(commalize(1000.5)).toBe('1,001');
  });
}
