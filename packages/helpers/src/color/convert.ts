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
  if (part === 'h') {
    if (number < 0 || number > 360) {
      return 360;
    }
    return number;
  }
  if (part === 'a') {
    return parseSafeAlpha(number);
  }
  if (number < 0 || number > 100) {
    return 100;
  }
  return number;
};

const parseSafeAlpha = (number: number): number => {
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
  const toHexByte = (value: number): string =>
    Math.round(parseSafeRgb(value)).toString(16).padStart(2, '0');
  return `${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}${
    a !== undefined && a < 1
      ? Math.round(parseSafeAlpha(a) * 255)
          .toString(16)
          .padStart(2, '0')
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

export const hexToHsl = (hex: string): HSL => {
  const { r, g, b, a } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  let h = 0;
  const l = (max + min) / 2;
  const delta = max - min;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const s = l >= 0.5 ? delta / (2 - (max + min)) : delta / (max + min);

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
    ...(a === undefined ? {} : { a }),
  };
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('parseSafeRgb', () => {
    it('0〜255の範囲内はそのまま返す', () => {
      expect(parseSafeRgb(128)).toBe(128);
      expect(parseSafeRgb(0)).toBe(0);
      expect(parseSafeRgb(255)).toBe(255);
    });

    it('範囲外・NaNは255に丸める', () => {
      expect(parseSafeRgb(-1)).toBe(255);
      expect(parseSafeRgb(300)).toBe(255);
      expect(parseSafeRgb(Number.NaN)).toBe(255);
    });
  });

  describe('parseSafeHsl', () => {
    it('各パートの範囲内はそのまま返す', () => {
      expect(parseSafeHsl(90, 'h')).toBe(90);
      expect(parseSafeHsl(50, 's')).toBe(50);
      expect(parseSafeHsl(0.5, 'a')).toBe(0.5);
    });

    it('hが360を超える/負の場合は360に丸める', () => {
      expect(parseSafeHsl(400, 'h')).toBe(360);
      expect(parseSafeHsl(-1, 'h')).toBe(360);
    });

    it('hが0〜360の範囲内はそのまま返す', () => {
      expect(parseSafeHsl(180, 'h')).toBe(180);
      expect(parseSafeHsl(0, 'h')).toBe(0);
      expect(parseSafeHsl(360, 'h')).toBe(360);
    });

    it('s/lは0〜100を超えると100に丸める', () => {
      expect(parseSafeHsl(200, 's')).toBe(100);
      expect(parseSafeHsl(-1, 'l')).toBe(100);
    });

    it('aは0〜1を超えると1に丸める', () => {
      expect(parseSafeHsl(2, 'a')).toBe(1);
      expect(parseSafeHsl(-1, 'a')).toBe(1);
    });
  });

  describe('hexToRgb', () => {
    it('6桁hexをRGBに変換する', () => {
      expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(hexToRgb('000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('3桁hexを展開して変換する', () => {
      expect(hexToRgb('fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it('不正な長さの場合は白を返す', () => {
      expect(hexToRgb('12345')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });
  });

  describe('rgbToHex', () => {
    it('RGBをhexに変換する', () => {
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('ffffff');
    });

    it('成分が16未満でもゼロパディングされる', () => {
      expect(rgbToHex({ r: 15, g: 0, b: 0 })).toBe('0f0000');
    });

    it('alphaが1未満のときは8桁になる', () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('ff000080');
    });

    it('非整数成分は四捨五入する', () => {
      expect(rgbToHex({ r: 15.4, g: 0, b: 0 })).toBe('0f0000');
      expect(rgbToHex({ r: 15.5, g: 0, b: 0 })).toBe('100000');
    });
  });

  describe('hexToHsl', () => {
    it('原色をHSLに変換する', () => {
      expect(hexToHsl('ff0000')).toEqual({ h: 0, s: 100, l: 50, a: 1 });
    });
  });

  describe('hslToHex', () => {
    it('HSLをhexに変換する', () => {
      expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe('ff0000');
    });
  });
}
