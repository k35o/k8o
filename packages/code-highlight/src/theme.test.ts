import oneLight from '@shikijs/themes/one-light';
import plastic from '@shikijs/themes/plastic';
import type { ThemeRegistration } from '@shikijs/types';
import { describe, expect, it } from 'vitest';

import { COLOR_REPLACEMENTS } from './theme.ts';

const THEMES = { 'one-light': oneLight, plastic } as const;

// コードの字が載る面。--color-* は @k8ordo/ui のトークン、注釈の行は annotate.css の color-mix
// （--color-border-* を 12〜18%）をその面に重ねた色。注釈の色には sRGB の外の色があり、計算した色と
// Chromium が描いた色が 1〜8 ずれるので、字とのコントラストが低くなる方を取った。
// plastic にスライドの注釈の行を入れないのは、入れるとコメント・紫・赤の字の色をブログでも明るくすることになるから
const SURFACES = {
  'one-light': {
    'ブログ（--color-bg-surface）': '#f6f7f7',
    'スライド（--color-bg-subtle）': '#eff0f1',
    'ai（one-light の背景）': '#fafafa',
    'ブログの hl の行': '#ede5cf',
    'ブログの + の行': '#d4eeda',
    'ブログの - の行': '#f7d9df',
    'ブログの callout の行': '#cee2f9',
    'スライドの hl の行': '#e7e0ca',
    'スライドの + の行': '#cee8d5',
    'スライドの - の行': '#f1d3d9',
    'スライドの callout の行': '#c8ddf3',
    'ブログの hl の行（prefers-contrast: more）': '#e3decf',
    'ブログの + の行（prefers-contrast: more）': '#d4e5d8',
    'ブログの - の行（prefers-contrast: more）': '#efd9db',
    'ブログの callout の行（prefers-contrast: more）': '#cad7f6',
    'スライドの hl の行（prefers-contrast: more）': '#ddd8ca',
    'スライドの + の行（prefers-contrast: more）': '#cedfd3',
    'スライドの - の行（prefers-contrast: more）': '#e9d3d5',
    'スライドの callout の行（prefers-contrast: more）': '#c4d2f1',
  },
  plastic: {
    'ブログ（--color-bg-surface）': '#111212',
    'スライド（--color-bg-subtle）': '#212222',
    'ai と OG（plastic の背景）': '#21252b',
    'ブログの hl の行': '#32290f',
    'ブログの + の行': '#0f2d1b',
    'ブログの - の行': '#321c1b',
    'ブログの callout の行': '#1e2d45',
    'ブログの hl の行（prefers-contrast: more）': '#372e0f',
    'ブログの + の行（prefers-contrast: more）': '#1d3023',
    'ブログの - の行（prefers-contrast: more）': '#312322',
    'ブログの callout の行（prefers-contrast: more）': '#283344',
  },
} as const;

// inherit のような色でない値は pre の字の色（editor.foreground）を継ぐので、色の値だけを集める
const textColorsOf = (theme: ThemeRegistration): string[] => {
  const colors = new Set<string>();
  const foreground = theme.colors?.['editor.foreground'];
  if (foreground !== undefined) {
    colors.add(foreground.toLowerCase());
  }
  for (const { settings } of theme.tokenColors ?? []) {
    if (settings.foreground?.startsWith('#') === true) {
      colors.add(settings.foreground.toLowerCase());
    }
  }
  return [...colors];
};

const linearChannel = (hex: string, offset: number): number => {
  const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number =>
  0.2126 * linearChannel(hex, 1) +
  0.7152 * linearChannel(hex, 3) +
  0.0722 * linearChannel(hex, 5);

const contrastRatio = (a: string, b: string): number => {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const replacementsOf = (
  themeName: keyof typeof THEMES,
): Record<string, string> => COLOR_REPLACEMENTS[themeName];

const replacedTextColorsOf = (themeName: keyof typeof THEMES): string[] => {
  const replacements = replacementsOf(themeName);
  return textColorsOf(THEMES[themeName]).map(
    (color) => replacements[color] ?? color,
  );
};

describe('COLOR_REPLACEMENTS', () => {
  describe('正常系', () => {
    it.each(
      Object.entries(SURFACES).flatMap(([themeName, surfaces]) =>
        Object.entries(surfaces).map(([surface, background]) => ({
          themeName: themeName as keyof typeof THEMES,
          surface,
          background,
        })),
      ),
    )(
      '$themeName の字の色は、置き換えたあと $surface の上で 4.5:1 以上になる',
      ({ themeName, background }) => {
        const below = replacedTextColorsOf(themeName)
          .map((color) => ({
            color,
            ratio: contrastRatio(color, background),
          }))
          .filter(({ ratio }) => ratio < 4.5);

        expect(below).toStrictEqual([]);
      },
    );
  });

  describe('エッジケース', () => {
    it.each(Object.keys(THEMES) as Array<keyof typeof THEMES>)(
      '%s の置き換える前の色は、テーマが字に使う色を小文字で書いたもの',
      (themeName) => {
        const textColors = textColorsOf(THEMES[themeName]);

        const unknown = Object.keys(replacementsOf(themeName)).filter(
          (color) => !textColors.includes(color),
        );

        expect(unknown).toStrictEqual([]);
      },
    );

    it.each(Object.keys(THEMES) as Array<keyof typeof THEMES>)(
      '%s の字の色は透明度を持たない 6 桁の16進で、面の色と重ねずにコントラストを測れる',
      (themeName) => {
        for (const color of textColorsOf(THEMES[themeName])) {
          expect(color).toMatch(/^#[\da-f]{6}$/u);
        }
      },
    );
  });
});
