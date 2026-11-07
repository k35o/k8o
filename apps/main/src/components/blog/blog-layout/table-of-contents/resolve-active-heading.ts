import { END_OF_CONTENT_ID } from '../constants';

// スクロールの位置は整数に丸められ、見出しの位置は端数を持つので、見出しへ飛んでも
// 読み取りラインを 1px まで行き過ぎて止まることがある
const SNAP_TOLERANCE = 1;

export type HeadingMeasurement = {
  id: string;
  top: number;
  /** 矩形が空（未レンダリング）でないか */
  isRendered: boolean;
  /** 記事末尾ブロック（#end-of-content）内の見出しか */
  isInsideEndOfContent: boolean;
};

// 「読み取りライン（画面上部から readingLine px）を最後に通過した見出し」を現在地とする。
// measurements は文書順であること
export const resolveActiveHeading = (
  measurements: readonly HeadingMeasurement[],
  isAtBottom: boolean,
  readingLine: number,
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
    if (measurement.top <= readingLine + SNAP_TOLERANCE) {
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
