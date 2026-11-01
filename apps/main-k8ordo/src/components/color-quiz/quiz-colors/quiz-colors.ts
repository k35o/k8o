export const generateRandomHex = (): string => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
};

// このモジュールが生成する #なし6桁hexだけを扱う前提の最小実装。
const hexToRgb = (hex: string): { r: number; g: number; b: number } => ({
  r: Number.parseInt(hex.slice(0, 2), 16),
  g: Number.parseInt(hex.slice(2, 4), 16),
  b: Number.parseInt(hex.slice(4, 6), 16),
});

const colorDistance = (hex1: string, hex2: string): number => {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return Math.hypot(c1.r - c2.r, c1.g - c2.g, c1.b - c2.b);
};

const MIN_DISTANCE_FROM_CORRECT = 40;
const MIN_DISTANCE_BETWEEN_OPTIONS = 25;

export const generateDistractors = (
  correctHex: string,
  count: number,
): string[] => {
  const correct = hexToRgb(correctHex);
  const distractors: string[] = [];

  let attempts = 0;
  while (distractors.length < count && attempts < 1000) {
    attempts++;
    const r = Math.max(
      0,
      Math.min(
        255,
        correct.r +
          (Math.random() > 0.5 ? 1 : -1) *
            (40 + Math.floor(Math.random() * 80)),
      ),
    );
    const g = Math.max(
      0,
      Math.min(
        255,
        correct.g +
          (Math.random() > 0.5 ? 1 : -1) *
            (40 + Math.floor(Math.random() * 80)),
      ),
    );
    const b = Math.max(
      0,
      Math.min(
        255,
        correct.b +
          (Math.random() > 0.5 ? 1 : -1) *
            (40 + Math.floor(Math.random() * 80)),
      ),
    );

    const hex = [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

    const distFromCorrect = colorDistance(hex, correctHex);
    if (distFromCorrect < MIN_DISTANCE_FROM_CORRECT) continue;

    const tooClose = distractors.some(
      (d) => colorDistance(hex, d) < MIN_DISTANCE_BETWEEN_OPTIONS,
    );
    if (tooClose) continue;

    distractors.push(hex);
  }

  return distractors;
};
