export type CornerRadius = {
  x: number;
  y: number;
};

export const CORNERS = [
  'topLeft',
  'topRight',
  'bottomRight',
  'bottomLeft',
] as const;

export type Corner = (typeof CORNERS)[number];

export type Axis = 'x' | 'y';

export type RadiusCorners = Record<Corner, CornerRadius>;
