import { useAppState } from '@k8ordo/state';
import { colorToOklch } from '@repo/helpers/color/spaces';
import type { Color } from '@repo/helpers/color/spaces';
import { between } from '@repo/helpers/number/between';

import {
  HUE,
  PEAK_CHROMA,
  isTokenName,
  paletteMakerState,
  readPaletteUrl,
} from '../search-params/search-params';

const roundTo = (value: number, digits: number): number =>
  Number(value.toFixed(digits));

export const usePaletteState = () => {
  const [values, update] = useAppState(paletteMakerState);
  const { hue, chroma, name } = readPaletteUrl(values);

  const setHue = (value: number): void => {
    update({ h: String(between(roundTo(value, 1), HUE.min, HUE.max)) });
  };

  const setChroma = (value: number): void => {
    update({
      c: String(between(roundTo(value, 3), PEAK_CHROMA.min, PEAK_CHROMA.max)),
    });
  };

  const setName = (value: string): void => {
    if (!isTokenName(value)) {
      return;
    }
    update({ name: value });
  };

  const setBaseColor = (color: Color): void => {
    const { c, h } = colorToOklch(color);
    const nextChroma = between(roundTo(c, 3), PEAK_CHROMA.min, PEAK_CHROMA.max);
    // 無彩色は hue が不定（colorToOklch は 0 に丸める）なので、色相は現状維持する
    update({
      ...(nextChroma > 0 && {
        h: String(between(roundTo(h, 1), HUE.min, HUE.max)),
      }),
      c: String(nextChroma),
    });
  };

  return {
    hue,
    chroma,
    name,
    setHue,
    setChroma,
    setName,
    setBaseColor,
  };
};
