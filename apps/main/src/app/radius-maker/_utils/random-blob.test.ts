import { generateBlobCorners } from './random-blob';

describe('generateBlobCorners', () => {
  it('すべての値が25〜75の範囲に収まる', () => {
    for (let i = 0; i < 100; i += 1) {
      const corners = generateBlobCorners();
      const values = Object.values(corners).flatMap(({ x, y }) => [x, y]);
      for (const value of values) {
        expect(value).toBeGreaterThanOrEqual(25);
        expect(value).toBeLessThanOrEqual(75);
      }
    }
  });

  it('各辺で向かい合う角の半径の和が100%になる', () => {
    for (let i = 0; i < 100; i += 1) {
      const { topLeft, topRight, bottomRight, bottomLeft } =
        generateBlobCorners();
      expect(topLeft.x + topRight.x).toBe(100);
      expect(bottomLeft.x + bottomRight.x).toBe(100);
      expect(topLeft.y + bottomLeft.y).toBe(100);
      expect(topRight.y + bottomRight.y).toBe(100);
    }
  });
});
