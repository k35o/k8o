type Dot = { cx: number; cy: number; r: number };

const LEG_PATHS = [
  'M -10 12 C 52 32, 30 92, 80 126 C 112 148, 98 198, 134 216',
  'M -6 52 C 32 72, 50 112, 46 152 C 43 186, 62 202, 82 216',
  'M -12 88 C 24 98, 40 122, 36 152 C 33 176, 46 192, 60 204',
];

const DOTS: Dot[] = [
  { cx: 62, cy: 108, r: 1.8 },
  { cx: 96, cy: 160, r: 1.8 },
  { cx: 50, cy: 150, r: 1.6 },
  { cx: 30, cy: 122, r: 1.6 },
  { cx: 52, cy: 196, r: 1.6 },
];

const LEG_COLOR = '#38929e';
const LEG_OPACITY = 0.5;

const buildSvg = (): string => {
  const pathElements = LEG_PATHS.map((d) => `<path d="${d}"/>`).join('');
  const dotElements = DOTS.map(
    (dot) =>
      `<circle cx="${dot.cx.toString()}" cy="${dot.cy.toString()}" r="${dot.r.toString()}"/>`,
  ).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">` +
    `<g transform="translate(0 240) scale(1 -1)">` +
    `<g fill="none" stroke="${LEG_COLOR}" stroke-opacity="${LEG_OPACITY.toString()}" stroke-width="2" stroke-linecap="round">${pathElements}</g>` +
    `<g fill="${LEG_COLOR}" fill-opacity="${LEG_OPACITY.toString()}">${dotElements}</g>` +
    `</g>` +
    `</svg>`
  );
};

export const getJellyfishLegsDataUrl = (): string =>
  `data:image/svg+xml,${encodeURIComponent(buildSvg())}`;
