import { convertHexToRgb } from './hex-rgb';
import type { Rgb } from './hex-rgb';
import { toLinear } from './spaces';

const calcLuminance = (rgbColor: Rgb) => {
  const [r8, g8, b8] = rgbColor;
  const r = toLinear(r8 / 255);
  const g = toLinear(g8 / 255);
  const b = toLinear(b8 / 255);
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
        const result = 21;
        expect(calcContrast('#000000', '#ffffff')).toBe(result);
        expect(calcContrast('#ffffff', '#000000')).toBe(result);
      });

      it('同じ色のコントラスト比は1になるべき', () => {
        expect(calcContrast('#000000', '#000000')).toBe(1);
        expect(calcContrast('#ffffff', '#ffffff')).toBe(1);
      });

      it('小文字のhex値でも正しく計算するべき', () => {
        const result = 21;
        expect(calcContrast('#000000', '#ffffff')).toBe(result);
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
