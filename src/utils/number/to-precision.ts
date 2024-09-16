export const toPrecision = (
  value: number,
  precision?: number,
): number => {
  const scaleFactor = 10 ** (precision ?? 10);
  return Math.round(value * scaleFactor) / scaleFactor;
};

if (import.meta.vitest) {
  it('数値を指定した桁数に丸める', () => {
    expect(toPrecision(1.2345, 0)).toBe(1);
    expect(toPrecision(1.2345, 1)).toBe(1.2);
    expect(toPrecision(1.2345, 2)).toBe(1.23);
    expect(toPrecision(1.2345, 3)).toBe(1.235);
    expect(toPrecision(1.2345, 4)).toBe(1.2345);
    expect(toPrecision(1.2345, 5)).toBe(1.2345);
  });
}
