// サロゲートペアを途中で切らないよう、UTF-16 の長さではなく文字で数える
const toChars = (text: string): string[] => Array.from(text);

export const countChars = (text: string): number => toChars(text).length;

export const firstChars = (text: string, max: number): string =>
  toChars(text).slice(0, max).join('');

export const truncateCharsWith = (
  text: string,
  max: number,
  suffix: (total: number) => string,
): string => {
  const chars = toChars(text);
  return chars.length <= max
    ? text
    : `${chars.slice(0, max).join('')}${suffix(chars.length)}`;
};

export const truncateChars = (text: string, max: number): string =>
  truncateCharsWith(text, max, () => '…');
