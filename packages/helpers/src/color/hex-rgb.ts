// calc-contrast / calc-apca が共用する 6桁 #RRGGBB 限定のパーサ。
// CSS Color 4 全般のパースは parse.ts の parseColor を使うこと。
export type Rgb = [number, number, number];

const validHexColorRegex = /^#[0-9A-Fa-f]{6}$/u;

export const convertHexToRgb = (hex: string): Rgb => {
  if (!validHexColorRegex.test(hex)) {
    throw new Error(
      `Invalid hex color format: ${hex}. Expected format: #RRGGBB`,
    );
  }

  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};
