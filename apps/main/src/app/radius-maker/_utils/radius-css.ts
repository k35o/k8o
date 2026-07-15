import { CORNERS } from '../_types/corner-radius';
import type { RadiusCorners } from '../_types/corner-radius';
import type { CornerShape } from '../_types/corner-shape';

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
