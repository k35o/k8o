import type { Oklch } from '@repo/helpers/color/spaces';

export const PALETTE_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

export type PaletteStep = (typeof PALETTE_STEPS)[number];

export type PaletteSwatch = {
  step: PaletteStep;
  hex: string;
  cssOklch: string;
  oklch: Oklch;
  isClamped: boolean;
  contrastWhite: number;
  contrastBlack: number;
  apcaWhite: number;
  apcaBlack: number;
  readableText: 'white' | 'black';
};
