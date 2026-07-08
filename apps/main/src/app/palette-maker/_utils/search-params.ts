import { createParser, parseAsFloat } from 'nuqs/server';

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

export const paletteMakerParsers = {
  hue: parseAsFloat.withDefault(HUE.default),
  chroma: parseAsFloat.withDefault(PEAK_CHROMA.default),
  name: createParser({
    parse: (query: string): string | null =>
      isTokenName(query) ? query : null,
    serialize: (value: string): string => value,
  }).withDefault(DEFAULT_TOKEN_NAME),
};

export const paletteMakerUrlKeys = {
  hue: 'h',
  chroma: 'c',
  name: 'name',
} as const;
