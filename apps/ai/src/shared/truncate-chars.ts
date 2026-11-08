// サロゲートペアを途中で切らないよう、UTF-16 の長さではなく文字で数える
export const truncateChars = (text: string, max: number): string => {
  const chars = Array.from(text);
  return chars.length <= max ? text : `${chars.slice(0, max).join('')}…`;
};
