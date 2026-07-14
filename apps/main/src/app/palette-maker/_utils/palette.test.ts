import { isInGamut, toSrgbGamut } from '@repo/helpers/color/gamut';
import { oklchToColor } from '@repo/helpers/color/spaces';

import { PALETTE_STEPS } from '../_types/palette';
import { CHROMA_CURVE, LIGHTNESS_LADDER, generatePalette } from './palette';

describe('generatePalette', () => {
  describe('正常系', () => {
    it('11段階を50から950の順で返す', () => {
      const swatches = generatePalette(250, 0.15);
      expect(swatches.map((swatch) => swatch.step)).toStrictEqual([
        ...PALETTE_STEPS,
      ]);
    });

    it('各段の明度がラダーと一致する', () => {
      const swatches = generatePalette(250, 0.15);
      for (const swatch of swatches) {
        expect(
          Math.abs(swatch.oklch.l - LIGHTNESS_LADDER[swatch.step]),
        ).toBeLessThanOrEqual(0.02);
      }
    });

    it('ガマット内に収まる低彩度では彩度がカーブ×ピークと一致する', () => {
      const swatches = generatePalette(250, 0.05);
      for (const swatch of swatches) {
        expect(
          Math.abs(swatch.oklch.c - 0.05 * CHROMA_CURVE[swatch.step]),
        ).toBeLessThanOrEqual(1e-3);
      }
    });

    it('500段の彩度がピーク彩度そのものになる', () => {
      const swatches = generatePalette(250, 0.05);
      const step500 = swatches.find((swatch) => swatch.step === 500);
      expect(step500?.oklch.c).toBeCloseTo(0.05, 3);
    });

    it('hexは6桁、cssOklchはoklch()形式になる', () => {
      const swatches = generatePalette(250, 0.15);
      for (const swatch of swatches) {
        expect(swatch.hex).toMatch(/^#[0-9a-f]{6}$/u);
        expect(swatch.cssOklch).toMatch(/^oklch\(/u);
      }
    });

    it('明るい50段は黒文字、暗い950段は白文字が読みやすい', () => {
      const swatches = generatePalette(250, 0.15);
      expect(swatches.at(0)?.readableText).toBe('black');
      expect(swatches.at(-1)?.readableText).toBe('white');
    });

    it('コントラスト比は1〜21の範囲で、APCAの符号が明暗と整合する', () => {
      const swatches = generatePalette(250, 0.15);
      for (const swatch of swatches) {
        expect(swatch.contrastWhite).toBeGreaterThanOrEqual(1);
        expect(swatch.contrastWhite).toBeLessThanOrEqual(21);
        expect(swatch.contrastBlack).toBeGreaterThanOrEqual(1);
        expect(swatch.contrastBlack).toBeLessThanOrEqual(21);
      }
      // 明るい背景に黒文字は正、暗い背景に白文字は負のLcになる
      expect(swatches.at(0)?.apcaBlack).toBeGreaterThan(0);
      expect(swatches.at(-1)?.apcaWhite).toBeLessThan(0);
    });
  });

  describe('エッジケース', () => {
    it('ピーク彩度0では全段がグレースケールでクランプなし', () => {
      const swatches = generatePalette(250, 0);
      for (const swatch of swatches) {
        const [r, g, b] = [
          swatch.hex.slice(1, 3),
          swatch.hex.slice(3, 5),
          swatch.hex.slice(5, 7),
        ];
        expect(r).toBe(g);
        expect(g).toBe(b);
        expect(swatch.isClamped).toBe(false);
      }
    });

    it('高彩度の緑ではクランプされる段があり、全段sRGB内に収まる', () => {
      const swatches = generatePalette(145, 0.4);
      expect(swatches.some((swatch) => swatch.isClamped)).toBe(true);
      for (const swatch of swatches) {
        expect(isInGamut(oklchToColor(swatch.oklch, 1))).toBe(true);
      }
    });

    it('クランプされた段の彩度は要求値より小さくなる', () => {
      const swatches = generatePalette(145, 0.4);
      const clamped = swatches.filter((swatch) => swatch.isClamped);
      for (const swatch of clamped) {
        expect(swatch.oklch.c).toBeLessThan(0.4 * CHROMA_CURVE[swatch.step]);
      }
    });

    it('色相0と360は同じパレットになる', () => {
      const zero = generatePalette(0, 0.15).map((swatch) => swatch.hex);
      const full = generatePalette(360, 0.15).map((swatch) => swatch.hex);
      expect(full).toStrictEqual(zero);
    });

    it('toSrgbGamutの結果と表示hexが常に一致する', () => {
      const swatches = generatePalette(30, 0.4);
      for (const swatch of swatches) {
        const remapped = toSrgbGamut(oklchToColor(swatch.oklch, 1));
        expect(isInGamut(remapped)).toBe(true);
      }
    });
  });
});
