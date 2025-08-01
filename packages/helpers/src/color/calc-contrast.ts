type RGB = [number, number, number];

const isValidHexColor = (hex: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
};

const convertHexToRgb = (hex: string): RGB => {
  if (!isValidHexColor(hex)) {
    throw new Error(
      `Invalid hex color format: ${hex}. Expected format: #RRGGBB`,
    );
  }

  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return [r, g, b];
};

const calcLuminance = (rgbColor: RGB) => {
  const [r8, g8, b8] = rgbColor;
  const rsrgb = r8 / 255;
  const gsrgb = g8 / 255;
  const bsrgb = b8 / 255;
  const r =
    rsrgb <= 0.04045
      ? rsrgb / 12.92
      : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
  const g =
    gsrgb <= 0.04045
      ? gsrgb / 12.92
      : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
  const b =
    bsrgb <= 0.04045
      ? bsrgb / 12.92
      : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const calcContrast = (color1: string, color2: string) => {
  const rgb1 = convertHexToRgb(color1);
  const rgb2 = convertHexToRgb(color2);
  const l1 = calcLuminance(rgb1);
  const l2 = calcLuminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('calcContrast', () => {
    describe('正常な入力の場合', () => {
      it('白と黒のコントラスト比を正しく計算するべき', () => {
        expect(calcContrast('#000000', '#ffffff')).toBe(21);
        expect(calcContrast('#ffffff', '#000000')).toBe(21);
      });

      it('同じ色のコントラスト比は1になるべき', () => {
        expect(calcContrast('#000000', '#000000')).toBe(1);
        expect(calcContrast('#ffffff', '#ffffff')).toBe(1);
      });

      it('小文字のhex値でも正しく計算するべき', () => {
        expect(calcContrast('#000000', '#ffffff')).toBe(21);
        expect(calcContrast('#ff0000', '#00ff00')).toBeGreaterThan(1);
      });
    });

    describe('異常な入力の場合', () => {
      it('無効なhex形式の場合はエラーを投げるべき', () => {
        expect(() => calcContrast('invalid', '#ffffff')).toThrow(
          'Invalid hex color format',
        );
        expect(() => calcContrast('#000000', 'invalid')).toThrow(
          'Invalid hex color format',
        );
        expect(() => calcContrast('#00000', '#ffffff')).toThrow(
          'Invalid hex color format',
        );
        expect(() => calcContrast('#0000000', '#ffffff')).toThrow(
          'Invalid hex color format',
        );
        expect(() => calcContrast('000000', '#ffffff')).toThrow(
          'Invalid hex color format',
        );
      });
    });
  });
}
