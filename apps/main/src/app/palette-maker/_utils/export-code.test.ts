import { PALETTE_STEPS } from '../_types/palette';
import { toCssVariablesCode, toTailwindThemeCode } from './export-code';
import { generatePalette } from './palette';

describe('export-code', () => {
  const swatches = generatePalette(250, 0.1);

  describe('toCssVariablesCode', () => {
    it(':rootブロックに11段の変数を宣言する', () => {
      const code = toCssVariablesCode('primary', swatches);
      const lines = code.split('\n');
      expect(lines.at(0)).toBe(':root {');
      expect(lines.at(-1)).toBe('}');
      expect(lines).toHaveLength(PALETTE_STEPS.length + 2);
    });

    it('変数値は各段のoklch()値と一致する', () => {
      const code = toCssVariablesCode('primary', swatches);
      for (const swatch of swatches) {
        expect(code).toContain(
          `  --color-primary-${swatch.step}: ${swatch.cssOklch};`,
        );
      }
    });

    it('ハイフンを含むトークン名でも変数名を組み立てられる', () => {
      const code = toCssVariablesCode('brand-accent', swatches);
      expect(code).toContain('--color-brand-accent-500:');
    });
  });

  describe('toTailwindThemeCode', () => {
    it('@themeブロックである以外はCSS変数と同じ内容になる', () => {
      const css = toCssVariablesCode('primary', swatches);
      const tailwind = toTailwindThemeCode('primary', swatches);
      expect(tailwind.split('\n').at(0)).toBe('@theme {');
      expect(tailwind.replace('@theme {', ':root {')).toBe(css);
    });
  });
});
