export type RGB = { r: number; g: number; b: number; a?: number };

export type HSL = { h: number; s: number; l: number; a?: number };

export const parseSafeRgb = (number: number): number => {
  if (Number.isNaN(number)) {
    return 255;
  }
  if (number < 0 || number > 255) {
    return 255;
  }
  return number;
};

export const parseSafeHsl = (number: number, part: keyof HSL): number => {
  if (Number.isNaN(number)) {
    return 100;
  }
  if (part === 'h' && (number < 0 || number > 360)) {
    return 360;
  }
  if (part === 'a') {
    return parseSafeAlpha(number);
  }
  if (number < 0 || number > 100) {
    return 100;
  }
  return number;
};

export const parseSafeAlpha = (number: number): number => {
  if (Number.isNaN(number)) {
    return 1;
  }
  if (number < 0 || number > 1) {
    return 1;
  }
  return number;
};

export const rgbToHex = (rgb: RGB): string => {
  const { r, g, b, a } = rgb;
  return `${parseSafeRgb(r).toString(16)}${parseSafeRgb(g).toString(
    16,
  )}${parseSafeRgb(b).toString(16)}${
    a !== undefined && a < 1
      ? Math.round(parseSafeAlpha(a) * 255).toString(16)
      : ''
  }`;
};

export const hexToRgb = (hex: string): RGB => {
  if (hex.length === 3) {
    const r = Number.parseInt(hex.slice(0, 1).repeat(2), 16);
    const g = Number.parseInt(hex.slice(1, 2).repeat(2), 16);
    const b = Number.parseInt(hex.slice(2, 3).repeat(2), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: 1,
    };
  }
  if (hex.length === 4) {
    const r = Number.parseInt(hex.slice(0, 1).repeat(2), 16);
    const g = Number.parseInt(hex.slice(1, 2).repeat(2), 16);
    const b = Number.parseInt(hex.slice(2, 3).repeat(2), 16);
    const a = Number.parseInt(hex.slice(3, 4).repeat(2), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: Math.round((parseSafeRgb(a) * 100) / 255) / 1,
    };
  }
  if (hex.length === 6) {
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: 1,
    };
  }
  if (hex.length === 8) {
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const a = Number.parseInt(hex.slice(6, 8), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: Math.round((parseSafeRgb(a) * 100) / 255) / 100,
    };
  }
  return { r: 255, g: 255, b: 255, a: 1 };
};

// ref: https://www.jameslmilner.com/posts/converting-rgb-hex-hsl-colors/
export const hslToHex = (hsl: HSL): string => {
  const h = parseSafeHsl(hsl.h, 'h');
  const s = parseSafeHsl(hsl.s, 's');
  const l = parseSafeHsl(hsl.l, 'l');
  const parsedA = parseSafeHsl(hsl.a ?? 1, 'a');
  const hexA = parsedA < 1 ? Math.round(parsedA * 255).toString(16) : '';

  const hDecimal = l / 100;
  const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `${f(0)}${f(8)}${f(4)}${hexA}`;
};

// ref: https://www.jameslmilner.com/posts/converting-rgb-hex-hsl-colors/
export const hexToHsl = (hex: string): HSL => {
  const { r, g, b, a } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const delta = max - min;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  s = l >= 0.5 ? delta / (2 - (max + min)) : delta / (max + min);

  switch (max) {
    case red:
      h = ((green - blue) / delta + 0) * 60;
      break;
    case green:
      h = ((blue - red) / delta + 2) * 60;
      break;
    case blue:
      h = ((red - green) / delta + 4) * 60;
      break;
  }

  return {
    h: Math.round(h < 0 ? h + 360 : h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    ...(a !== undefined ? { a } : {}),
  };
};
