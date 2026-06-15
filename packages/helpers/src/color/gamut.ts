import {
  type Color,
  clamp,
  colorToOklab,
  colorToOklch,
  oklchToColor,
} from './spaces';

const GAMUT_EPSILON = 1e-4;

export const isInGamut = (color: Color, tolerance = GAMUT_EPSILON): boolean =>
  color.r >= -tolerance &&
  color.r <= 1 + tolerance &&
  color.g >= -tolerance &&
  color.g <= 1 + tolerance &&
  color.b >= -tolerance &&
  color.b <= 1 + tolerance;

const clip = (color: Color): Color => ({
  r: clamp(color.r, 0, 1),
  g: clamp(color.g, 0, 1),
  b: clamp(color.b, 0, 1),
  alpha: color.alpha,
});

const deltaEOK = (a: Color, b: Color): number => {
  const oklabA = colorToOklab(a);
  const oklabB = colorToOklab(b);
  const dl = oklabA.l - oklabB.l;
  const da = oklabA.a - oklabB.a;
  const db = oklabA.b - oklabB.b;
  return Math.hypot(dl, da, db);
};

export const toSrgbGamut = (color: Color): Color => {
  if (isInGamut(color)) {
    return clip(color);
  }

  const { l, h } = colorToOklch(color);
  if (l >= 1) {
    return { r: 1, g: 1, b: 1, alpha: color.alpha };
  }
  if (l <= 0) {
    return { r: 0, g: 0, b: 0, alpha: color.alpha };
  }

  const jnd = 0.02;
  const searchEpsilon = 1e-4;
  let min = 0;
  let max = colorToOklch(color).c;
  let minInGamut = true;
  let clipped = clip(oklchToColor({ l, c: max, h }, color.alpha));

  while (max - min > searchEpsilon) {
    const chroma = (min + max) / 2;
    const candidate = oklchToColor({ l, c: chroma, h }, color.alpha);

    if (minInGamut && isInGamut(candidate)) {
      min = chroma;
      continue;
    }

    clipped = clip(candidate);
    const error = deltaEOK(clipped, candidate);
    if (error < jnd) {
      if (jnd - error < searchEpsilon) {
        return clipped;
      }
      minInGamut = false;
      min = chroma;
    } else {
      max = chroma;
    }
  }

  return clipped;
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('isInGamut', () => {
    it('sRGB内はtrue', () => {
      expect(isInGamut({ r: 0.5, g: 0.2, b: 0.9, alpha: 1 })).toBe(true);
    });
    it('範囲外はfalse', () => {
      expect(isInGamut({ r: 1.5, g: 0, b: 0, alpha: 1 })).toBe(false);
      expect(isInGamut({ r: 0, g: -0.2, b: 0, alpha: 1 })).toBe(false);
    });
  });

  describe('toSrgbGamut', () => {
    it('sRGB内の色はクリップのみで保持される', () => {
      const color: Color = { r: 0.4, g: 0.6, b: 0.2, alpha: 0.8 };
      const mapped = toSrgbGamut(color);
      expect(Math.abs(mapped.r - 0.4)).toBeLessThan(1e-6);
      expect(Math.abs(mapped.g - 0.6)).toBeLessThan(1e-6);
      expect(mapped.alpha).toBe(0.8);
    });

    it('sRGB外の鮮やかなoklchをsRGB内へ写像する', () => {
      const outOfGamut = oklchToColor({ l: 0.7, c: 0.4, h: 30 }, 1);
      expect(isInGamut(outOfGamut)).toBe(false);
      const mapped = toSrgbGamut(outOfGamut);
      expect(isInGamut(mapped)).toBe(true);
      expect(mapped.alpha).toBe(1);
    });
  });
}
