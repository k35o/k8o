import {
  clamp,
  colorToHsl,
  colorToHwb,
  colorToLab,
  colorToLch,
  colorToOklab,
  colorToOklch,
  colorToRgb255,
} from './spaces';
import type { Color } from './spaces';

const round = (value: number, digits: number): number => {
  const rounded = Number(value.toFixed(digits));
  return Object.is(rounded, -0) ? 0 : rounded;
};

const alphaText = (alpha: number): string =>
  round(clamp(alpha, 0, 1), 4).toString();

const hasAlpha = (color: Color): boolean => color.alpha < 1;

const toHexByte = (value: number): string =>
  Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, '0');

export const formatHex = (color: Color): string => {
  const { r, g, b } = colorToRgb255(color);
  const base = `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
  return hasAlpha(color)
    ? `${base}${toHexByte(Math.round(color.alpha * 255))}`
    : base;
};

export const formatRgb = (color: Color): string => {
  const { r, g, b } = colorToRgb255(color);
  const [ri, gi, bi] = [Math.round(r), Math.round(g), Math.round(b)];
  return hasAlpha(color)
    ? `rgba(${ri}, ${gi}, ${bi}, ${alphaText(color.alpha)})`
    : `rgb(${ri}, ${gi}, ${bi})`;
};

export const formatHsl = (color: Color): string => {
  const { h, s, l } = colorToHsl(color);
  const [hi, si, li] = [round(h, 0), round(s, 0), round(l, 0)];
  return hasAlpha(color)
    ? `hsla(${hi}, ${si}%, ${li}%, ${alphaText(color.alpha)})`
    : `hsl(${hi}, ${si}%, ${li}%)`;
};

export const formatHwb = (color: Color): string => {
  const { h, w, b } = colorToHwb(color);
  const body = `${round(h, 0)} ${round(w, 0)}% ${round(b, 0)}%`;
  return hasAlpha(color)
    ? `hwb(${body} / ${alphaText(color.alpha)})`
    : `hwb(${body})`;
};

export const formatLab = (color: Color): string => {
  const { l, a, b } = colorToLab(color);
  const body = `${round(l, 2)} ${round(a, 2)} ${round(b, 2)}`;
  return hasAlpha(color)
    ? `lab(${body} / ${alphaText(color.alpha)})`
    : `lab(${body})`;
};

export const formatLch = (color: Color): string => {
  const { l, c, h } = colorToLch(color);
  const body = `${round(l, 2)} ${round(c, 2)} ${round(h, 2)}`;
  return hasAlpha(color)
    ? `lch(${body} / ${alphaText(color.alpha)})`
    : `lch(${body})`;
};

export const formatOklab = (color: Color): string => {
  const { l, a, b } = colorToOklab(color);
  const body = `${round(l, 4)} ${round(a, 4)} ${round(b, 4)}`;
  return hasAlpha(color)
    ? `oklab(${body} / ${alphaText(color.alpha)})`
    : `oklab(${body})`;
};

export const formatOklch = (color: Color): string => {
  const { l, c, h } = colorToOklch(color);
  const body = `${round(l, 4)} ${round(c, 4)} ${round(h, 2)}`;
  return hasAlpha(color)
    ? `oklch(${body} / ${alphaText(color.alpha)})`
    : `oklch(${body})`;
};

export type ColorFormatKey =
  | 'hex'
  | 'rgb'
  | 'hsl'
  | 'hwb'
  | 'oklch'
  | 'oklab'
  | 'lch'
  | 'lab';

export const formatAll = (
  color: Color,
): Array<{ key: ColorFormatKey; label: string; value: string }> => [
  { key: 'hex', label: 'HEX', value: formatHex(color) },
  { key: 'rgb', label: 'RGB', value: formatRgb(color) },
  { key: 'hsl', label: 'HSL', value: formatHsl(color) },
  { key: 'hwb', label: 'HWB', value: formatHwb(color) },
  { key: 'oklch', label: 'OKLCH', value: formatOklch(color) },
  { key: 'oklab', label: 'OKLAB', value: formatOklab(color) },
  { key: 'lch', label: 'LCH', value: formatLch(color) },
  { key: 'lab', label: 'LAB', value: formatLab(color) },
];

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  const TEAL: Color = { r: 94 / 255, g: 234 / 255, b: 212 / 255, alpha: 1 };
  const RED: Color = { r: 1, g: 0, b: 0, alpha: 1 };
  const HALF: Color = { r: 1, g: 0, b: 0, alpha: 0.5 };

  describe('formatHex', () => {
    it('alphaなしは6桁', () => {
      expect(formatHex(TEAL)).toBe('#5eead4');
    });
    it('alphaありは8桁', () => {
      expect(formatHex(HALF)).toBe('#ff000080');
    });
    it('成分が16未満でもゼロパディングされる', () => {
      expect(formatHex({ r: 15 / 255, g: 0, b: 0, alpha: 1 })).toBe('#0f0000');
    });
  });

  describe('formatRgb / formatHsl', () => {
    it('rgb はレガシー構文', () => {
      expect(formatRgb(TEAL)).toBe('rgb(94, 234, 212)');
      expect(formatRgb(HALF)).toBe('rgba(255, 0, 0, 0.5)');
    });
    it('hsl は赤で hsl(0, 100%, 50%)', () => {
      expect(formatHsl(RED)).toBe('hsl(0, 100%, 50%)');
    });
  });

  describe('format（モダン構文）', () => {
    it('hwb / lab / lch / oklab / oklch を生成する', () => {
      expect(formatHwb(RED).startsWith('hwb(')).toBe(true);
      expect(formatLab(RED).startsWith('lab(')).toBe(true);
      expect(formatLch(RED).startsWith('lch(')).toBe(true);
      expect(formatOklab(RED).startsWith('oklab(')).toBe(true);
      expect(formatOklch(RED).startsWith('oklch(')).toBe(true);
    });
    it('白の lab は lab(100 0 0)', () => {
      expect(formatLab({ r: 1, g: 1, b: 1, alpha: 1 })).toBe('lab(100 0 0)');
    });
    it('alpha付きは / 区切り', () => {
      expect(formatOklch(HALF).includes('/ 0.5')).toBe(true);
    });
  });

  describe('formatAll', () => {
    it('8形式をこの順で返す', () => {
      const keys = formatAll(TEAL).map((entry) => entry.key);
      expect(keys).toEqual([
        'hex',
        'rgb',
        'hsl',
        'hwb',
        'oklch',
        'oklab',
        'lch',
        'lab',
      ]);
    });
  });
}
