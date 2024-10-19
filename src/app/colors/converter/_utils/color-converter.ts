export type RGB = { r: number; g: number; b: number; a?: number };

export const parseSafeRgb = (number: number): number => {
  if (isNaN(number)) {
    return 255;
  }
  if (number < 0 || number > 255) {
    return 255;
  }
  return number;
};

export const rgbToHex = (rgb: RGB): string => {
  const { r, g, b, a } = rgb;
  return `${parseSafeRgb(r).toString(16)}${parseSafeRgb(g).toString(
    16,
  )}${parseSafeRgb(b).toString(16)}${
    a !== undefined && a < 1
      ? Math.round(parseSafeRgb(a * 255)).toString(16)
      : ''
  }`;
};

export const hexToRgb = (hex: string): RGB => {
  if (hex.length === 3) {
    const r = parseInt(hex.slice(0, 1).repeat(2), 16);
    const g = parseInt(hex.slice(1, 2).repeat(2), 16);
    const b = parseInt(hex.slice(2, 3).repeat(2), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: 1,
    };
  }
  if (hex.length === 4) {
    const r = parseInt(hex.slice(0, 1).repeat(2), 16);
    const g = parseInt(hex.slice(1, 2).repeat(2), 16);
    const b = parseInt(hex.slice(2, 3).repeat(2), 16);
    const a = parseInt(hex.slice(3, 4).repeat(2), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: Math.round((parseSafeRgb(a) * 100) / 255) / 1,
    };
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: 1,
    };
  }
  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: Math.round((parseSafeRgb(a) * 100) / 255) / 100,
    };
  }
  return { r: 255, g: 255, b: 255, a: 1 };
};
