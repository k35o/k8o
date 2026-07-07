import type { PaletteSwatch } from '../_types/palette';

const toVariableLines = (
  name: string,
  swatches: readonly PaletteSwatch[],
): string =>
  swatches
    .map((swatch) => `  --color-${name}-${swatch.step}: ${swatch.cssOklch};`)
    .join('\n');

export const toCssVariablesCode = (
  name: string,
  swatches: readonly PaletteSwatch[],
): string => `:root {\n${toVariableLines(name, swatches)}\n}`;

export const toTailwindThemeCode = (
  name: string,
  swatches: readonly PaletteSwatch[],
): string => `@theme {\n${toVariableLines(name, swatches)}\n}`;
