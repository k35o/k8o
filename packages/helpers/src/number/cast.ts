import { toPrecision } from './to-precision';

const FLOATING_POINT_REGEX = /^[Ee0-9+\-.]$/;

// 文字が数値になり得ないことを確認する
const isInvalidCharacter = (value: string): boolean =>
  FLOATING_POINT_REGEX.test(value);

// 数値になり得ない文字を削除する
const sanitize = (value: string): string =>
  value
    .split('')
    .filter((character) => isInvalidCharacter(character))
    .join('');

// 数値を綺麗に変換する
const parse = (value: string | number): number =>
  Number.parseFloat(value.toString().replaceAll(/[^\w.-]+/g, ''));

// 小数点以下の桁数を取得する
const countDecimalPlaces = (value: number): number => {
  if (!Number.isFinite(value)) return 0;

  let e = 1;
  let p = 0;
  while (Math.round(value * e) / e !== value) {
    e *= 10;
    p += 1;
  }
  return p;
};

export const cast = (
  value: string,
  step: number,
  precision?: number,
): number => {
  const parsedValue = parse(sanitize(value));
  if (Number.isNaN(parsedValue)) return 0;
  const decimalPlaces = Math.max(
    countDecimalPlaces(step),
    countDecimalPlaces(parsedValue),
  );
  return toPrecision(parsedValue, precision ?? decimalPlaces);
};

if (import.meta.vitest) {
  it('文字を数値に変換する', () => {
    expect(cast('1', 1)).toBe(1);
    expect(cast('1.1', 1)).toBe(1.1);
    expect(cast('1.1.1', 1)).toBe(1.1);
    expect(cast('1.1.1', 2)).toBe(1.1);
    expect(cast('1e4', 3)).toBe(10_000);
    expect(cast('-19', 3)).toBe(-19);
  });
}
