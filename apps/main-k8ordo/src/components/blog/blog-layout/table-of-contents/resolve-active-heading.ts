import { END_OF_CONTENT_ID } from '../constants';

export const ACTIVE_LINE_OFFSET = 96;

export type HeadingMeasurement = {
  id: string;
  top: number;
  /** 矩形が空（未レンダリング）でないか */
  isRendered: boolean;
  /** 記事末尾ブロック（#end-of-content）内の見出しか */
  isInsideEndOfContent: boolean;
};

// 「読み取りライン（画面上部 ACTIVE_LINE_OFFSET px）を最後に通過した見出し」を現在地とする。
// measurements は文書順であること
export const resolveActiveHeading = (
  measurements: readonly HeadingMeasurement[],
  isAtBottom: boolean,
): string => {
  let current = '';
  for (const measurement of measurements) {
    if (
      measurement.id !== END_OF_CONTENT_ID &&
      measurement.isInsideEndOfContent
    ) {
      continue;
    }
    if (!measurement.isRendered) {
      continue;
    }
    if (measurement.top <= ACTIVE_LINE_OFFSET) {
      current = measurement.id;
    }
  }
  if (isAtBottom && measurements.length > 0) {
    const eoc = measurements.find(
      (measurement) => measurement.id === END_OF_CONTENT_ID,
    );
    current = eoc?.id ?? measurements.at(-1)?.id ?? current;
  }
  return current;
};
