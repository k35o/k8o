import { CORNERS, type RadiusCorners } from '../_types/corner-radius';
import type { CornerShape } from '../_types/corner-shape';

// CSSの省略規則(4値→3値→2値→1値)に従って
// 左上・右上・右下・左下の順の4値を最短の表記に簡約する
const simplifyValues = (
  topLeft: number,
  topRight: number,
  bottomRight: number,
  bottomLeft: number,
): string => {
  if (bottomLeft !== topRight) {
    return `${topLeft}% ${topRight}% ${bottomRight}% ${bottomLeft}%`;
  }
  if (bottomRight !== topLeft) {
    return `${topLeft}% ${topRight}% ${bottomRight}%`;
  }
  if (topRight !== topLeft) {
    return `${topLeft}% ${topRight}%`;
  }
  return `${topLeft}%`;
};

// border-radiusの値文字列を生成する。
// 水平と垂直が同じ表記になる場合はスラッシュ以降を省略する
export const toBorderRadiusValue = (corners: RadiusCorners): string => {
  const horizontal = simplifyValues(
    corners.topLeft.x,
    corners.topRight.x,
    corners.bottomRight.x,
    corners.bottomLeft.x,
  );
  const vertical = simplifyValues(
    corners.topLeft.y,
    corners.topRight.y,
    corners.bottomRight.y,
    corners.bottomLeft.y,
  );
  return horizontal === vertical ? horizontal : `${horizontal} / ${vertical}`;
};

export const cornersEqual = (a: RadiusCorners, b: RadiusCorners): boolean =>
  CORNERS.every(
    (corner) => a[corner].x === b[corner].x && a[corner].y === b[corner].y,
  );

// コピーやプレビューに使うCSS宣言の文字列を生成する。
// corner-shapeは標準値(round)のときは出力しない
export const toCssText = (
  corners: RadiusCorners,
  shape: CornerShape,
): string => {
  const lines = [`border-radius: ${toBorderRadiusValue(corners)};`];
  if (shape !== 'round') {
    lines.push(`corner-shape: ${shape};`);
  }
  return lines.join('\n');
};
