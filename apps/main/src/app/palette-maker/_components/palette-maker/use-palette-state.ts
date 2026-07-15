import { colorToOklch } from '@repo/helpers/color/spaces';
import type { Color } from '@repo/helpers/color/spaces';
import { between } from '@repo/helpers/number/between';
import { throttle, useQueryStates } from 'nuqs';
import { useCallback } from 'react';

import {
  HUE,
  PEAK_CHROMA,
  isTokenName,
  paletteMakerParsers,
  paletteMakerUrlKeys,
} from '../../_utils/search-params';

const roundTo = (value: number, digits: number): number =>
  Number(value.toFixed(digits));

export const usePaletteState = () => {
  const [{ hue, chroma, name }, setState] = useQueryStates(
    paletteMakerParsers,
    {
      history: 'replace',
      limitUrlUpdates: throttle(200),
      urlKeys: paletteMakerUrlKeys,
    },
  );

  const setHue = useCallback(
    (value: number) => {
      void setState({ hue: between(roundTo(value, 1), HUE.min, HUE.max) });
    },
    [setState],
  );

  const setChroma = useCallback(
    (value: number) => {
      void setState({
        chroma: between(roundTo(value, 3), PEAK_CHROMA.min, PEAK_CHROMA.max),
      });
    },
    [setState],
  );

  const setName = useCallback(
    (value: string) => {
      if (!isTokenName(value)) {
        return;
      }
      void setState({ name: value });
    },
    [setState],
  );

  const setBaseColor = useCallback(
    (color: Color) => {
      const { c, h } = colorToOklch(color);
      const nextChroma = between(
        roundTo(c, 3),
        PEAK_CHROMA.min,
        PEAK_CHROMA.max,
      );
      // 無彩色は hue が不定（colorToOklch は 0 に丸める）なので、色相は現状維持する
      void setState({
        ...(nextChroma > 0 && {
          hue: between(roundTo(h, 1), HUE.min, HUE.max),
        }),
        chroma: nextChroma,
      });
    },
    [setState],
  );

  return {
    hue: between(hue, HUE.min, HUE.max),
    chroma: between(chroma, PEAK_CHROMA.min, PEAK_CHROMA.max),
    name,
    setHue,
    setChroma,
    setName,
    setBaseColor,
  };
};
