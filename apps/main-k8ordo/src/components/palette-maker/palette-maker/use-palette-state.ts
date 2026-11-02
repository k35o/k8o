import { useAppState } from '@k8ordo/state';
import { colorToOklch } from '@repo/helpers/color/spaces';
import type { Color } from '@repo/helpers/color/spaces';
import { between } from '@repo/helpers/number/between';

import { useUrlDraft } from '@/shared/browser/use-url-draft';

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
  const [committed, update] = useAppState(paletteMakerState);
  const { values, change, commit, commitProps } = useUrlDraft(
    committed,
    update,
  );
  const { hue, chroma, name } = readPaletteUrl(values);

  const setHue = (value: number): void => {
    change({ h: String(between(roundTo(value, 1), HUE.min, HUE.max)) });
  };

  const setChroma = (value: number): void => {
    change({
      c: String(between(roundTo(value, 3), PEAK_CHROMA.min, PEAK_CHROMA.max)),
    });
  };

  // 貼り付けは keyup も click も来ないので、欄の 2 つは入力ごとに書く（一覧の q と同じ）
  const setName = (value: string): void => {
    if (!isTokenName(value)) {
      return;
    }
    commit({ name: value });
  };

  const setBaseColor = (color: Color): void => {
    const { c, h } = colorToOklch(color);
    const nextChroma = between(roundTo(c, 3), PEAK_CHROMA.min, PEAK_CHROMA.max);
    // 無彩色は hue が不定（colorToOklch は 0 に丸める）なので、色相は現状維持する
    commit({
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
    commitProps,
  };
};
