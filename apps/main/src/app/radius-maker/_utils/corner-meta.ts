import type { Axis, Corner } from '../_types/corner-radius';

export const CORNER_LABELS: Record<Corner, string> = {
  topLeft: '左上',
  topRight: '右上',
  bottomRight: '右下',
  bottomLeft: '左下',
};

export const AXIS_LABELS: Record<Axis, string> = {
  x: '水平',
  y: '垂直',
};
