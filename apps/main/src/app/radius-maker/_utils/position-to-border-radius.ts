import type { RadiusPosition } from '../_types/radius-position';

// border-radius文字列を生成
export const positionToBorderRadius = (position: RadiusPosition): string => {
  return `${position.topLeftX}% ${position.topRightX}% ${position.bottomRightX}% ${position.bottomLeftX}% / ${position.topLeftY}% ${position.topRightY}% ${position.bottomRightY}% ${position.bottomLeftY}%`;
};
