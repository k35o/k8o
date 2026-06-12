/**
 * OGP画像用のクラゲの足(細いライン+ドット)SVGをdata URLで返す。
 * パスデータは app/_components/global-layout/background のものと同じ。
 * OGは常にライトテーマなので色は固定。
 */

type Dot = { cx: number; cy: number; r: number };

// 左上の足（多め・大きめ）。viewBox 0 0 240 240。
const LEG_PATHS_TOP_LEFT = [
  'M 6 -16 C 36 36, 18 86, 70 116 C 104 135, 92 182, 138 196',
  'M -16 26 C 40 44, 72 78, 72 124 C 72 158, 104 176, 116 208',
  'M -8 72 C 28 80, 44 104, 40 140 C 38 162, 52 176, 70 186',
];

const DOTS_TOP_LEFT: Dot[] = [
  { cx: 58, cy: 104, r: 2 },
  { cx: 84, cy: 142, r: 2 },
  { cx: 112, cy: 180, r: 2 },
  { cx: 72, cy: 126, r: 1.8 },
  { cx: 104, cy: 176, r: 1.8 },
  { cx: 42, cy: 140, r: 1.8 },
  { cx: 60, cy: 182, r: 1.6 },
];

// サイトの右下の足をベースに、内側に短い1本を足した3本構成。
// OGでは下辺用に上下反転して使う。
const LEG_PATHS_BOTTOM = [
  'M -10 12 C 52 32, 30 92, 80 126 C 112 148, 98 198, 134 216',
  'M -6 52 C 32 72, 50 112, 46 152 C 43 186, 62 202, 82 216',
  'M -12 88 C 24 98, 40 122, 36 152 C 33 176, 46 192, 60 204',
];

const DOTS_BOTTOM: Dot[] = [
  { cx: 62, cy: 108, r: 1.8 },
  { cx: 96, cy: 160, r: 1.8 },
  { cx: 50, cy: 150, r: 1.6 },
  { cx: 30, cy: 122, r: 1.6 },
  { cx: 52, cy: 196, r: 1.6 },
];

// site側の oklch(0.6 0.09 195 / 0.5) 相当
const LEG_COLOR = '#38929e';
const LEG_OPACITY = 0.5;

const buildSvg = (paths: string[], dots: Dot[], flipY: boolean): string => {
  const transform = flipY ? ' transform="translate(0 240) scale(1 -1)"' : '';
  const pathElements = paths.map((d) => `<path d="${d}"/>`).join('');
  const dotElements = dots
    .map(
      (dot) =>
        `<circle cx="${dot.cx.toString()}" cy="${dot.cy.toString()}" r="${dot.r.toString()}"/>`,
    )
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">` +
    `<g${transform}>` +
    `<g fill="none" stroke="${LEG_COLOR}" stroke-opacity="${LEG_OPACITY.toString()}" stroke-width="2" stroke-linecap="round">${pathElements}</g>` +
    `<g fill="${LEG_COLOR}" fill-opacity="${LEG_OPACITY.toString()}">${dotElements}</g>` +
    `</g>` +
    `</svg>`
  );
};

export const getJellyfishLegsDataUrl = (
  variant: 'top-left' | 'bottom-left',
): string => {
  const svg =
    variant === 'top-left'
      ? buildSvg(LEG_PATHS_TOP_LEFT, DOTS_TOP_LEFT, false)
      : buildSvg(LEG_PATHS_BOTTOM, DOTS_BOTTOM, true);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
