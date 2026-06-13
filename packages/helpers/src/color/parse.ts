// 任意の CSS 色文字列を正準 Color へパースする。
//
// 統一スマート入力の心臓部。無効・未完成な入力では null を返すことで、
// 「入力途中でプレビューが暴れる」課題を解決する（呼び出し側は null の間
// 直前の有効な色を保持できる）。
//
// 対応: hex / rgb() / rgba() / hsl() / hsla() / hwb() /
//       lab() / lch() / oklab() / oklch() / 名前付き色 / transparent

import { toSrgbGamut } from './gamut';
import { NAMED_COLORS } from './named-colors';
import {
  type Color,
  clamp,
  hslToColor,
  hwbToColor,
  labToColor,
  lchToColor,
  oklabToColor,
  oklchToColor,
  rgb255ToColor,
} from './spaces';

type Num = { value: number; percent: boolean };

const NUMBER = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?';

// 3要素ちょうどであることを検証してタプルに固める。
const triple = (parts: string[]): [string, string, string] | null => {
  const [a, b, c] = parts;
  if (
    parts.length !== 3 ||
    a === undefined ||
    b === undefined ||
    c === undefined
  ) {
    return null;
  }
  return [a, b, c];
};

// 数値トークン（任意で末尾 %、`none` は 0 扱い）。
const parseNum = (token: string): Num | null => {
  if (token === 'none') {
    return { value: 0, percent: false };
  }
  const match = token.match(new RegExp(`^(${NUMBER})(%)?$`, 'iu'));
  const raw = match?.[1];
  if (raw === undefined) {
    return null;
  }
  const value = Number.parseFloat(raw);
  // `1e999` のような巨大指数は Infinity になるため弾く（NaN色の流出を防ぐ）。
  if (!Number.isFinite(value)) {
    return null;
  }
  return { value, percent: match?.[2] === '%' };
};

// 角度トークン（deg/grad/rad/turn、`none` は 0）。
const parseHue = (token: string): number | null => {
  if (token === 'none') {
    return 0;
  }
  const match = token.match(
    new RegExp(`^(${NUMBER})(deg|grad|rad|turn)?$`, 'iu'),
  );
  const raw = match?.[1];
  if (raw === undefined) {
    return null;
  }
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) {
    return null;
  }
  switch ((match?.[2] ?? 'deg').toLowerCase()) {
    case 'rad':
      return (value * 180) / Math.PI;
    case 'grad':
      return value * 0.9;
    case 'turn':
      return value * 360;
    default:
      return value;
  }
};

const parseAlpha = (token: string | null): number | null => {
  if (token === null) {
    return 1;
  }
  const num = parseNum(token);
  if (num === null) {
    return null;
  }
  return clamp(num.percent ? num.value / 100 : num.value, 0, 1);
};

// `func(a b c / d)`（modern）/ `func(a, b, c, d)`（legacy）の引数を分解する。
// CSS構文に厳密に従い、空要素・カンマとスペースの混在・spaceでのalpha省略などの
// 不正入力は null を返す（誤って有効判定して値が飛ぶのを防ぐ）。
const splitArgs = (
  body: string,
): { parts: string[]; alpha: string | null } | null => {
  let main = body.trim();
  let alpha: string | null = null;

  if (main.includes('/')) {
    const segments = main.split('/');
    const [head, tail] = segments;
    if (segments.length !== 2 || head === undefined || tail === undefined) {
      return null;
    }
    main = head.trim();
    alpha = tail.trim();
    // alpha は単一トークン。空・空白・カンマ混じりは不正。
    if (alpha === '' || /[\s,]/u.test(alpha)) {
      return null;
    }
  }

  if (main === '') {
    return null;
  }

  if (main.includes(',')) {
    // legacy comma 構文: 厳密にカンマ区切り。各要素は空でも空白混じりでもない。
    const parts = main.split(',').map((token) => token.trim());
    if (parts.some((token) => token === '' || /\s/u.test(token))) {
      return null;
    }
    // `rgba(r, g, b, a)` は 4 番目が alpha。
    if (alpha === null && parts.length === 4) {
      alpha = parts.pop() ?? null;
    }
    return { parts, alpha };
  }

  // modern space 構文: 空白区切り。alpha は `/` 経由のみ。
  const parts = main.split(/\s+/u).filter(Boolean);
  return { parts, alpha };
};

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/iu;

const hexToInt = (value: string): number => Number.parseInt(value, 16);

const parseHex = (input: string): Color | null => {
  const hex = input.match(HEX_PATTERN)?.[1];
  if (hex === undefined) {
    return null;
  }

  if (hex.length === 3 || hex.length === 4) {
    const r = hexToInt(hex.slice(0, 1).repeat(2));
    const g = hexToInt(hex.slice(1, 2).repeat(2));
    const b = hexToInt(hex.slice(2, 3).repeat(2));
    const alpha =
      hex.length === 4 ? hexToInt(hex.slice(3, 4).repeat(2)) / 255 : 1;
    return rgb255ToColor({ r, g, b }, alpha);
  }
  const r = hexToInt(hex.slice(0, 2));
  const g = hexToInt(hex.slice(2, 4));
  const b = hexToInt(hex.slice(4, 6));
  const alpha = hex.length === 8 ? hexToInt(hex.slice(6, 8)) / 255 : 1;
  return rgb255ToColor({ r, g, b }, alpha);
};

// rgb()/rgba(): 数値は 0..255、% は 0..100% → 0..255。
const parseRgbFn = (parts: string[], alpha: number): Color | null => {
  const tokens = triple(parts);
  if (tokens === null) {
    return null;
  }
  const channel = (token: string): number | null => {
    const num = parseNum(token);
    if (num === null) {
      return null;
    }
    return clamp(num.percent ? (num.value / 100) * 255 : num.value, 0, 255);
  };
  const r = channel(tokens[0]);
  const g = channel(tokens[1]);
  const b = channel(tokens[2]);
  if (r === null || g === null || b === null) {
    return null;
  }
  return rgb255ToColor({ r, g, b }, alpha);
};

// hue + percent×2 を取る関数（hsl/hwb）の共通パーサ。
const parseHuePercentPercent = (
  parts: string[],
): { h: number; x: number; y: number } | null => {
  const tokens = triple(parts);
  if (tokens === null) {
    return null;
  }
  const h = parseHue(tokens[0]);
  const x = parseNum(tokens[1]);
  const y = parseNum(tokens[2]);
  if (h === null || x === null || y === null) {
    return null;
  }
  return { h, x: x.value, y: y.value };
};

// L + 2成分 + hue系の汎用パーサ（lab/lch/oklab/oklch）。
// percentScale: L が % のときの満点値、abScale: a/b/C が % のときの満点値。
const parseLabLike = (
  parts: string[],
  options: {
    lScale: number;
    abScale: number;
    polar: boolean;
  },
): { l: number; m: number; n: number } | null => {
  const tokens = triple(parts);
  if (tokens === null) {
    return null;
  }
  const lNum = parseNum(tokens[0]);
  if (lNum === null) {
    return null;
  }
  const l = lNum.percent ? (lNum.value / 100) * options.lScale : lNum.value;

  const second = parseNum(tokens[1]);
  if (second === null) {
    return null;
  }
  const m = second.percent
    ? (second.value / 100) * options.abScale
    : second.value;

  if (options.polar) {
    // lch/oklch: 3番目は hue。
    const h = parseHue(tokens[2]);
    if (h === null) {
      return null;
    }
    return { l, m, n: h };
  }
  const third = parseNum(tokens[2]);
  if (third === null) {
    return null;
  }
  const n = third.percent ? (third.value / 100) * options.abScale : third.value;
  return { l, m, n };
};

export const parseColor = (input: string): Color | null => {
  const normalized = input.trim().toLowerCase();
  if (normalized === '') {
    return null;
  }

  if (normalized === 'transparent') {
    return { r: 0, g: 0, b: 0, alpha: 0 };
  }

  const named = NAMED_COLORS[normalized];
  if (named !== undefined) {
    return parseHex(named);
  }

  const hex = parseHex(normalized);
  if (hex !== null) {
    return hex;
  }

  const fnMatch = normalized.match(/^([a-z]+)\((.*)\)$/u);
  const name = fnMatch?.[1];
  const body = fnMatch?.[2];
  if (name === undefined || body === undefined) {
    return null;
  }
  const split = splitArgs(body);
  if (split === null) {
    return null;
  }
  const alpha = parseAlpha(split.alpha);
  if (alpha === null) {
    return null;
  }
  const { parts } = split;

  let color: Color | null;
  switch (name) {
    case 'rgb':
    case 'rgba':
      color = parseRgbFn(parts, alpha);
      break;
    case 'hsl':
    case 'hsla': {
      const parsed = parseHuePercentPercent(parts);
      color =
        parsed === null
          ? null
          : hslToColor({ h: parsed.h, s: parsed.x, l: parsed.y }, alpha);
      break;
    }
    case 'hwb': {
      const parsed = parseHuePercentPercent(parts);
      color =
        parsed === null
          ? null
          : hwbToColor({ h: parsed.h, w: parsed.x, b: parsed.y }, alpha);
      break;
    }
    case 'lab': {
      const parsed = parseLabLike(parts, {
        lScale: 100,
        abScale: 125,
        polar: false,
      });
      color =
        parsed === null
          ? null
          : labToColor({ l: parsed.l, a: parsed.m, b: parsed.n }, alpha);
      break;
    }
    case 'lch': {
      const parsed = parseLabLike(parts, {
        lScale: 100,
        abScale: 150,
        polar: true,
      });
      color =
        parsed === null
          ? null
          : lchToColor({ l: parsed.l, c: parsed.m, h: parsed.n }, alpha);
      break;
    }
    case 'oklab': {
      const parsed = parseLabLike(parts, {
        lScale: 1,
        abScale: 0.4,
        polar: false,
      });
      color =
        parsed === null
          ? null
          : oklabToColor({ l: parsed.l, a: parsed.m, b: parsed.n }, alpha);
      break;
    }
    case 'oklch': {
      const parsed = parseLabLike(parts, {
        lScale: 1,
        abScale: 0.4,
        polar: true,
      });
      color =
        parsed === null
          ? null
          : oklchToColor({ l: parsed.l, c: parsed.m, h: parsed.n }, alpha);
      break;
    }
    default:
      return null;
  }

  if (color === null) {
    return null;
  }
  // 正準は sRGB。sRGB 外（鮮やかな oklch 等）はガマット内へ写像する。
  return toSrgbGamut(color);
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  const near = (actual: number, expected: number, tolerance = 0.01): void => {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
  };

  describe('parseColor 正常系', () => {
    it('hex（#あり/なし・3/6/8桁）', () => {
      expect(parseColor('#ff0000')).not.toBeNull();
      const red = parseColor('#ff0000');
      near(red?.r ?? -1, 1);
      near(red?.g ?? -1, 0);
      near(red?.b ?? -1, 0);

      const short = parseColor('f00');
      near(short?.r ?? -1, 1);

      const withAlpha = parseColor('#ff000080');
      near(withAlpha?.alpha ?? -1, 128 / 255, 0.01);
    });

    it('rgb() カンマ/スペース両構文', () => {
      const a = parseColor('rgb(94, 234, 212)');
      const b = parseColor('rgb(94 234 212)');
      near(a?.r ?? -1, 94 / 255);
      near(b?.r ?? -1, 94 / 255);
      near(b?.g ?? -1, 234 / 255);
    });

    it('rgba() と / alpha', () => {
      near(parseColor('rgba(0, 0, 0, 0.5)')?.alpha ?? -1, 0.5);
      near(parseColor('rgb(0 0 0 / 50%)')?.alpha ?? -1, 0.5);
    });

    it('hsl()', () => {
      const c = parseColor('hsl(0, 100%, 50%)');
      near(c?.r ?? -1, 1);
      near(c?.g ?? -1, 0);
    });

    it('hwb()', () => {
      const white = parseColor('hwb(0 100% 0%)');
      near(white?.r ?? -1, 1);
      near(white?.g ?? -1, 1);
    });

    it('oklch()（往復で赤に戻る）', () => {
      const c = parseColor('oklch(62.8% 0.2577 29.23)');
      near(c?.r ?? -1, 1, 0.02);
      near(c?.g ?? -1, 0, 0.02);
      near(c?.b ?? -1, 0, 0.02);
    });

    it('lab() / lch() / oklab()', () => {
      expect(parseColor('lab(54.29 80.81 69.89)')).not.toBeNull();
      expect(parseColor('lch(54.29 106.84 40.85)')).not.toBeNull();
      expect(parseColor('oklab(0.628 0.225 0.126)')).not.toBeNull();
    });

    it('名前付き色 / transparent', () => {
      const teal = parseColor('teal');
      near(teal?.r ?? -1, 0);
      near(teal?.g ?? -1, 128 / 255);
      near(teal?.b ?? -1, 128 / 255);
      expect(parseColor('transparent')?.alpha).toBe(0);
    });

    it('大文字・前後空白を許容', () => {
      expect(parseColor('  #FF0000  ')).not.toBeNull();
      expect(parseColor('RGB(255 0 0)')).not.toBeNull();
    });
  });

  describe('parseColor 異常系（入力途中の曖昧さ対策）', () => {
    it('未完成・不正な入力は null', () => {
      expect(parseColor('#ff')).toBeNull();
      expect(parseColor('#fffff')).toBeNull();
      expect(parseColor('rgb(255, 0')).toBeNull();
      expect(parseColor('rgb(255 0 0')).toBeNull();
      expect(parseColor('rgb(255, 0, 0, 0, 0)')).toBeNull();
      expect(parseColor('hsl(0 100)')).toBeNull();
      expect(parseColor('notacolor')).toBeNull();
      expect(parseColor('')).toBeNull();
      expect(parseColor('rgb(abc, 0, 0)')).toBeNull();
    });

    it('巨大指数（Infinity化）は null（NaN色を流出させない）', () => {
      expect(parseColor('hsl(1e999 50% 50%)')).toBeNull();
      expect(parseColor('rgb(1e999 0 0)')).toBeNull();
      expect(parseColor('oklch(1e999 0.1 180)')).toBeNull();
    });

    it('カンマ/スペースの不正な混在・空要素・alpha省略は null', () => {
      expect(parseColor('rgb(255,,0,0)')).toBeNull();
      expect(parseColor('rgb(255, 0 0)')).toBeNull();
      // space構文で / なしの4値はalphaにできない。
      expect(parseColor('rgb(255 0 0 0.5)')).toBeNull();
      // alpha部に余分なトークン。
      expect(parseColor('rgb(0 0 0 / 0.5 0.2)')).toBeNull();
    });

    it('正当なカンマ/スペース/ slash alpha は引き続き有効', () => {
      expect(parseColor('rgb(94, 234, 212)')).not.toBeNull();
      expect(parseColor('rgb(94 234 212)')).not.toBeNull();
      expect(parseColor('rgba(0, 0, 0, 0.5)')).not.toBeNull();
      expect(parseColor('rgb(0 0 0 / 50%)')).not.toBeNull();
    });
  });

  describe('parseColor ガマット', () => {
    it('sRGB外のoklchはガマット内へ写像される', () => {
      const c = parseColor('oklch(0.7 0.4 30)');
      expect(c).not.toBeNull();
      if (c !== null) {
        expect(c.r).toBeLessThanOrEqual(1.0001);
        expect(c.r).toBeGreaterThanOrEqual(-0.0001);
        expect(c.g).toBeGreaterThanOrEqual(-0.0001);
      }
    });
  });
}
