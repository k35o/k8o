import { calcApca } from '@repo/helpers/color/calc-apca';
import { calcContrast } from '@repo/helpers/color/calc-contrast';
import { formatHex, formatOklch } from '@repo/helpers/color/format';
import { isInGamut, toSrgbGamut } from '@repo/helpers/color/gamut';
import { colorToOklch, oklchToColor } from '@repo/helpers/color/spaces';

import { PALETTE_STEPS } from '../_types/palette';
import type { PaletteStep, PaletteSwatch } from '../_types/palette';

// ArteOdyssey の tokens.css と同じ、全色相共通の明度ラダー
export const LIGHTNESS_LADDER: Record<PaletteStep, number> = {
  50: 0.975,
  100: 0.945,
  200: 0.9,
  300: 0.84,
  400: 0.75,
  500: 0.66,
  600: 0.575,
  700: 0.49,
  800: 0.41,
  900: 0.37,
  950: 0.18,
};

// ArteOdyssey の red ランプの彩度をピーク(500)で正規化した係数
export const CHROMA_CURVE: Record<PaletteStep, number> = {
  50: 0.06,
  100: 0.16,
  200: 0.31,
  300: 0.56,
  400: 0.83,
  500: 1,
  600: 0.94,
  700: 0.81,
  800: 0.67,
  900: 0.52,
  950: 0.37,
};

const WHITE_HEX = '#ffffff';
const BLACK_HEX = '#000000';

export const generatePalette = (
  hue: number,
  peakChroma: number,
): PaletteSwatch[] =>
  PALETTE_STEPS.map((step): PaletteSwatch => {
    const requested = {
      l: LIGHTNESS_LADDER[step],
      c: peakChroma * CHROMA_CURVE[step],
      h: hue,
    };
    const raw = oklchToColor(requested, 1);
    const isClamped = !isInGamut(raw);
    const mapped = toSrgbGamut(raw);
    const hex = formatHex(mapped);
    const contrastWhite = calcContrast(hex, WHITE_HEX);
    const contrastBlack = calcContrast(hex, BLACK_HEX);
    return {
      step,
      hex,
      cssOklch: formatOklch(mapped),
      oklch: colorToOklch(mapped),
      isClamped,
      contrastWhite,
      contrastBlack,
      apcaWhite: calcApca(WHITE_HEX, hex),
      apcaBlack: calcApca(BLACK_HEX, hex),
      readableText: contrastWhite >= contrastBlack ? 'white' : 'black',
    };
  });
