import type { RadiusCorners } from '../_types/corner-radius';

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// 各辺の分割点をランダムに選び、向かい合う角の半径の和が辺全体(100%)になるようにすると
// 凹みのない有機的なブロブ形状になる
export const generateBlobCorners = (): RadiusCorners => {
  const top = randomInt(25, 75);
  const bottom = randomInt(25, 75);
  const left = randomInt(25, 75);
  const right = randomInt(25, 75);
  return {
    topLeft: { x: top, y: left },
    topRight: { x: 100 - top, y: right },
    bottomRight: { x: 100 - bottom, y: 100 - right },
    bottomLeft: { x: bottom, y: 100 - left },
  };
};
