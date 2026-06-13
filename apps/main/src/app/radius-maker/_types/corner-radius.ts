// 1つの角の丸み。x: 水平方向、y: 垂直方向の半径(各辺に対する%、0〜100の整数)
export type CornerRadius = {
  x: number;
  y: number;
};

// CSSのborder-radiusの記述順(左上→右上→右下→左下)
export const CORNERS = [
  'topLeft',
  'topRight',
  'bottomRight',
  'bottomLeft',
] as const;

export type Corner = (typeof CORNERS)[number];

export type Axis = 'x' | 'y';

// 4つの角の丸み。CSSのborder-radius値と1:1で対応する
export type RadiusCorners = Record<Corner, CornerRadius>;
