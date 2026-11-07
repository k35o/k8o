import { definePageState } from '@k8ordo/state';
import { between } from '@repo/helpers/number/between';
import * as z from 'zod/mini';

import type { RadiusCorners } from '../corner-radius/corner-radius';
import { CORNER_SHAPES } from '../corner-shape/corner-shape';
import { BLOB_CORNERS } from '../presets/presets';

export const PREVIEW_SIZE = {
  min: 80,
  max: 320,
  default: 192,
} as const;

const isRadiusValue = (value: number): boolean =>
  Number.isInteger(value) && value >= 0 && value <= 100;

export const parseCorners = (query: string): RadiusCorners | null => {
  const values = query.split(',').map(Number);
  if (values.length !== 8 || !values.every((value) => isRadiusValue(value))) {
    return null;
  }
  const [
    topLeftX = 0,
    topLeftY = 0,
    topRightX = 0,
    topRightY = 0,
    bottomRightX = 0,
    bottomRightY = 0,
    bottomLeftX = 0,
    bottomLeftY = 0,
  ] = values;
  return {
    topLeft: { x: topLeftX, y: topLeftY },
    topRight: { x: topRightX, y: topRightY },
    bottomRight: { x: bottomRightX, y: bottomRightY },
    bottomLeft: { x: bottomLeftX, y: bottomLeftY },
  };
};

export const serializeCorners = (corners: RadiusCorners): string =>
  [
    corners.topLeft.x,
    corners.topLeft.y,
    corners.topRight.x,
    corners.topRight.y,
    corners.bottomRight.x,
    corners.bottomRight.y,
    corners.bottomLeft.x,
    corners.bottomLeft.y,
  ].join(',');

// r・w・h は URL の文字列のまま持ち、読むときに解く。z.pipe・z.transform・z.number・z.refine を足すと、
// zod の本体が入る frame-*.js が大きくなり、どのページも +0.7kB 読む
export const radiusMakerState = definePageState('radius-maker', {
  url: z.object({
    r: z._default(z.string(), serializeCorners(BLOB_CORNERS)),
    w: z._default(z.string(), String(PREVIEW_SIZE.default)),
    h: z._default(z.string(), String(PREVIEW_SIZE.default)),
    s: z._default(z.enum(CORNER_SHAPES), 'round'),
  }),
});

// 外に貼られたリンクの読みを nuqs の parseAsInteger と between にそろえる（?w=10 は 80、?w=100.7 は 100、
// ?w= は既定）
const readSize = (value: string): number => {
  // oxlint-disable-next-line radix -- parseAsInteger と同じく radix を渡さず、0x100 を 256 と読む
  const parsed = Number.parseInt(value);
  return Number.isNaN(parsed)
    ? PREVIEW_SIZE.default
    : between(parsed, PREVIEW_SIZE.min, PREVIEW_SIZE.max);
};

export const readRadiusUrl = (url: {
  r: string;
  w: string;
  h: string;
}): { corners: RadiusCorners; width: number; height: number } => ({
  corners: parseCorners(url.r) ?? BLOB_CORNERS,
  width: readSize(url.w),
  height: readSize(url.h),
});
