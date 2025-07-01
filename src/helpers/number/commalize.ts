export const commalize = (num: number) => {
  // 少数は四捨五入して整数にする
  const roundedNumber = Math.round(num);
  const numberString = roundedNumber.toString();

  // 3桁ごとにカンマを挿入
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

if (import.meta.vitest) {
  it('3桁未満の場合はそのまま返す', () => {
    expect(commalize(100)).toBe('100');
  });

  it('4桁の場合はカンマ区切りにする', () => {
    expect(commalize(1000)).toBe('1,000');
  });

  it('3桁毎にカンマ区切りにする', () => {
    expect(commalize(1000000)).toBe('1,000,000');
  });

  it('少数の場合は四捨五入して整数にする', () => {
    expect(commalize(1000.5)).toBe('1,001');
  });
}
