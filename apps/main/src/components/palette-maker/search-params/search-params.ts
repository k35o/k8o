import { definePageState } from '@k8ordo/state';
import { between } from '@repo/helpers/number/between';
import * as z from 'zod/mini';

export const HUE = {
  min: 0,
  max: 360,
  default: 250,
} as const;

// 初期表示でガマットクランプ（＊表示）が出ないよう、h=250で全段sRGB内に収まる値にする
export const PEAK_CHROMA = {
  min: 0,
  max: 0.4,
  default: 0.12,
} as const;

const DEFAULT_TOKEN_NAME = 'primary';

const TOKEN_NAME_MAX_LENGTH = 32;
const TOKEN_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

export const isTokenName = (value: string): boolean =>
  value.length <= TOKEN_NAME_MAX_LENGTH && TOKEN_NAME_PATTERN.test(value);

// どの値も URL の文字列のまま持ち、読むときに解く。z.pipe・z.transform・z.number・z.refine を足すと、
// zod の本体が入る frame-*.js が大きくなり、どのページも +0.7kB 読む
export const paletteMakerState = definePageState('palette-maker', {
  url: z.object({
    h: z._default(z.string(), String(HUE.default)),
    c: z._default(z.string(), String(PEAK_CHROMA.default)),
    name: z._default(z.string(), DEFAULT_TOKEN_NAME),
  }),
});

// 外に貼られたリンクの読みを nuqs の parseAsFloat と between にそろえる（?h=400 は 360、?h=12abc は 12、
// ?h= は既定）
const readFloat = (
  value: string,
  range: { min: number; max: number; default: number },
): number => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed)
    ? range.default
    : between(parsed, range.min, range.max);
};

export const readPaletteUrl = (url: {
  h: string;
  c: string;
  name: string;
}): { hue: number; chroma: number; name: string } => ({
  hue: readFloat(url.h, HUE),
  chroma: readFloat(url.c, PEAK_CHROMA),
  name: isTokenName(url.name) ? url.name : DEFAULT_TOKEN_NAME,
});
