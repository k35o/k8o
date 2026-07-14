type Rgb = [number, number, number];

const validHexColorRegex = /^#[0-9A-Fa-f]{6}$/u;

const isValidHexColor = (hex: string): boolean => validHexColorRegex.test(hex);

const convertHexToRgb = (hex: string): Rgb => {
  if (!isValidHexColor(hex)) {
    throw new Error(
      `Invalid hex color format: ${hex}. Expected format: #RRGGBB`,
    );
  }

  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

const SA98G = {
  mainTrc: 2.4,
  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.072175,
  normBg: 0.56,
  normText: 0.57,
  revText: 0.62,
  revBg: 0.65,
  blkThrs: 0.022,
  // APCA仕様の定数はちょうど1.414であり、Math.SQRT2（1.41421356...）ではない
  // oxlint-disable-next-line oxc/approx-constant
  blkClmp: 1.414,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loBoWOffset: 0.027,
  loWoBOffset: 0.027,
  loClip: 0.1,
  deltaYMin: 0.0005,
} as const;

const calcScreenLuminance = (rgbColor: Rgb): number => {
  const [r, g, b] = rgbColor;
  return (
    SA98G.sRco * (r / 255) ** SA98G.mainTrc +
    SA98G.sGco * (g / 255) ** SA98G.mainTrc +
    SA98G.sBco * (b / 255) ** SA98G.mainTrc
  );
};

const clampBlackLevel = (y: number): number =>
  y > SA98G.blkThrs ? y : y + (SA98G.blkThrs - y) ** SA98G.blkClmp;

export const calcApca = (
  textColor: string,
  backgroundColor: string,
): number => {
  const textY = clampBlackLevel(
    calcScreenLuminance(convertHexToRgb(textColor)),
  );
  const bgY = clampBlackLevel(
    calcScreenLuminance(convertHexToRgb(backgroundColor)),
  );

  if (Math.abs(bgY - textY) < SA98G.deltaYMin) {
    return 0;
  }

  if (bgY > textY) {
    const sapc =
      (bgY ** SA98G.normBg - textY ** SA98G.normText) * SA98G.scaleBoW;
    return sapc < SA98G.loClip ? 0 : (sapc - SA98G.loBoWOffset) * 100;
  }

  const sapc = (bgY ** SA98G.revBg - textY ** SA98G.revText) * SA98G.scaleWoB;
  return sapc > -SA98G.loClip ? 0 : (sapc + SA98G.loWoBOffset) * 100;
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('calcApca', () => {
    describe('正常な入力の場合', () => {
      it('明るい背景に暗い文字の場合は正のLc値を返すべき', () => {
        expect(calcApca('#888888', '#ffffff')).toBeCloseTo(
          63.05646993020942,
          10,
        );
        expect(calcApca('#000000', '#aaaaaa')).toBeCloseTo(
          58.14626257856133,
          10,
        );
        expect(calcApca('#112233', '#ddeeff')).toBeCloseTo(
          91.66830811481631,
          10,
        );
      });

      it('暗い背景に明るい文字の場合は負のLc値を返すべき', () => {
        expect(calcApca('#ffffff', '#888888')).toBeCloseTo(
          -68.54146436644962,
          10,
        );
        expect(calcApca('#aaaaaa', '#000000')).toBeCloseTo(
          -56.24113336839742,
          10,
        );
        expect(calcApca('#ddeeff', '#112233')).toBeCloseTo(
          -93.06770049484275,
          10,
        );
      });

      it('同じ色の場合は0を返すべき', () => {
        expect(calcApca('#000000', '#000000')).toBe(0);
        expect(calcApca('#ffffff', '#ffffff')).toBe(0);
        expect(calcApca('#888888', '#888888')).toBe(0);
      });
    });

    describe('エッジケース', () => {
      it('コントラストが非常に低い場合は0にクリップされるべき', () => {
        expect(calcApca('#112233', '#444444')).toBeCloseTo(
          8.32326136957393,
          10,
        );
        expect(calcApca('#444444', '#112233')).toBeCloseTo(
          -7.526878460278154,
          10,
        );
        expect(calcApca('#fefefe', '#ffffff')).toBe(0);
      });
    });

    describe('異常な入力の場合', () => {
      it('無効なhex形式の場合はエラーを投げるべき', () => {
        expect(() => calcApca('invalid', '#ffffff')).toThrow(
          'Invalid hex color format',
        );
        expect(() => calcApca('#000000', 'invalid')).toThrow(
          'Invalid hex color format',
        );
        expect(() => calcApca('#000', '#ffffff')).toThrow(
          'Invalid hex color format',
        );
      });
    });
  });
}
