export type Color = { r: number; g: number; b: number; alpha: number };

export type Rgb255 = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };
export type Hwb = { h: number; w: number; b: number };
export type Lab = { l: number; a: number; b: number };
export type Lch = { l: number; c: number; h: number };
export type Oklab = { l: number; a: number; b: number };
export type Oklch = { l: number; c: number; h: number };

type Vec3 = [number, number, number];
type Mat3 = [Vec3, Vec3, Vec3];

const multiply = (m: Mat3, v: Vec3): Vec3 => [
  m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
  m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
  m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const normalizeHue = (hue: number): number => ((hue % 360) + 360) % 360;

const toLinear = (channel: number): number => {
  const sign = channel < 0 ? -1 : 1;
  const abs = Math.abs(channel);
  return abs <= 0.040_45
    ? channel / 12.92
    : sign * ((abs + 0.055) / 1.055) ** 2.4;
};

const toGamma = (channel: number): number => {
  const sign = channel < 0 ? -1 : 1;
  const abs = Math.abs(channel);
  return abs <= 0.003_130_8
    ? channel * 12.92
    : sign * (1.055 * abs ** (1 / 2.4) - 0.055);
};

const LINEAR_RGB_TO_XYZ: Mat3 = [
  [0.412_390_799_265_959_34, 0.357_584_339_383_878, 0.180_480_788_401_834_3],
  [0.212_639_005_871_510_27, 0.715_168_678_767_756, 0.072_192_315_360_733_71],
  [0.019_330_818_715_591_82, 0.119_194_779_794_625_98, 0.950_532_152_249_660_7],
];

const XYZ_TO_LINEAR_RGB: Mat3 = [
  [3.240_969_941_904_522_6, -1.537_383_177_570_094, -0.498_610_760_293_003_4],
  [-0.969_243_636_280_879_6, 1.875_967_501_507_720_2, 0.041_555_057_407_175_59],
  [
    0.055_630_079_696_993_66, -0.203_976_958_888_976_52,
    1.056_971_514_242_878_6,
  ],
];

const D65_TO_D50: Mat3 = [
  [
    1.047_929_820_840_548_8, 0.022_946_793_341_019_088,
    -0.050_192_229_543_135_57,
  ],
  [0.029_627_815_688_159_344, 0.990_434_484_573_249, -0.017_073_825_029_385_14],
  [
    -0.009_243_058_152_591_178, 0.015_055_144_896_577_895,
    0.751_874_289_958_000_8,
  ],
];

const D50_TO_D65: Mat3 = [
  [
    0.955_473_452_704_218_2, -0.023_098_536_874_261_423,
    0.063_259_308_661_021_7,
  ],
  [
    -0.028_369_706_963_208_136, 1.009_995_458_005_822_6,
    0.021_041_398_966_943_008,
  ],
  [
    0.012_314_001_688_319_899, -0.020_507_696_433_477_912,
    1.330_365_936_608_075_3,
  ],
];

const XYZ_TO_LMS: Mat3 = [
  [0.819_022_437_996_703, 0.361_906_260_052_890_4, -0.128_873_781_520_987_9],
  [0.032_983_653_932_388_5, 0.929_286_861_586_343_4, 0.036_144_666_350_642_4],
  [0.048_177_189_359_624_2, 0.264_239_531_752_730_8, 0.633_547_828_469_430_9],
];

const LMS_TO_OKLAB: Mat3 = [
  [0.210_454_268_309_314, 0.793_617_774_702_305_4, -0.004_072_043_011_619_3],
  [1.977_998_532_431_168_4, -2.428_592_242_048_58, 0.450_593_709_617_411],
  [0.025_904_042_465_547_8, 0.782_771_712_457_529_6, -0.808_675_754_923_077_4],
];

const OKLAB_TO_LMS: Mat3 = [
  [1.0, 0.396_337_777_376_174_9, 0.215_803_757_309_913_6],
  [1.0, -0.105_561_345_815_658_6, -0.063_854_172_825_813_3],
  [1.0, -0.089_484_177_529_811_9, -1.291_485_548_019_409_2],
];

const LMS_TO_XYZ: Mat3 = [
  [1.226_879_875_845_924_3, -0.557_814_994_460_217_1, 0.281_391_045_665_964_7],
  [-0.040_575_745_214_800_8, 1.112_286_803_280_317, -0.071_711_058_065_516_4],
  [-0.076_372_936_674_660_1, -0.421_493_332_402_243_2, 1.586_924_019_836_781_6],
];

const D50_WHITE: Vec3 = [
  0.3457 / 0.3585,
  1.0,
  (1.0 - 0.3457 - 0.3585) / 0.3585,
];
const LAB_EPSILON = 216 / 24_389;
const LAB_KAPPA = 24_389 / 27;

const colorToXyzD65 = (color: Color): Vec3 =>
  multiply(LINEAR_RGB_TO_XYZ, [
    toLinear(color.r),
    toLinear(color.g),
    toLinear(color.b),
  ]);

const xyzD65ToColor = (xyz: Vec3, alpha: number): Color => {
  const [r, g, b] = multiply(XYZ_TO_LINEAR_RGB, xyz);
  return { r: toGamma(r), g: toGamma(g), b: toGamma(b), alpha };
};

export const colorToOklab = (color: Color): Oklab => {
  const lms = multiply(XYZ_TO_LMS, colorToXyzD65(color));
  const [l, a, b] = multiply(LMS_TO_OKLAB, [
    Math.cbrt(lms[0]),
    Math.cbrt(lms[1]),
    Math.cbrt(lms[2]),
  ]);
  return { l, a, b };
};

export const oklabToColor = (oklab: Oklab, alpha: number): Color => {
  const lmsPrime = multiply(OKLAB_TO_LMS, [oklab.l, oklab.a, oklab.b]);
  const lms: Vec3 = [lmsPrime[0] ** 3, lmsPrime[1] ** 3, lmsPrime[2] ** 3];
  return xyzD65ToColor(multiply(LMS_TO_XYZ, lms), alpha);
};

export const colorToOklch = (color: Color): Oklch => {
  const { l, a, b } = colorToOklab(color);
  const c = Math.hypot(a, b);
  // 無彩色（C≈0）の hue は不定なので 0 に丸める。
  const h = c < 1e-6 ? 0 : normalizeHue((Math.atan2(b, a) * 180) / Math.PI);
  return { l, c, h };
};

export const oklchToColor = (oklch: Oklch, alpha: number): Color => {
  const hueRad = (oklch.h * Math.PI) / 180;
  return oklabToColor(
    {
      l: oklch.l,
      a: oklch.c * Math.cos(hueRad),
      b: oklch.c * Math.sin(hueRad),
    },
    alpha,
  );
};

export const colorToLab = (color: Color): Lab => {
  const xyzD50 = multiply(D65_TO_D50, colorToXyzD65(color));
  const f = (t: number): number =>
    t > LAB_EPSILON ? Math.cbrt(t) : (LAB_KAPPA * t + 16) / 116;
  const fx = f(xyzD50[0] / D50_WHITE[0]);
  const fy = f(xyzD50[1] / D50_WHITE[1]);
  const fz = f(xyzD50[2] / D50_WHITE[2]);
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
};

export const labToColor = (lab: Lab, alpha: number): Color => {
  const fy = (lab.l + 16) / 116;
  const fx = lab.a / 500 + fy;
  const fz = fy - lab.b / 200;
  const fx3 = fx ** 3;
  const fz3 = fz ** 3;
  const xyzD50: Vec3 = [
    (fx3 > LAB_EPSILON ? fx3 : (116 * fx - 16) / LAB_KAPPA) * D50_WHITE[0],
    (lab.l > LAB_KAPPA * LAB_EPSILON ? fy ** 3 : lab.l / LAB_KAPPA) *
      D50_WHITE[1],
    (fz3 > LAB_EPSILON ? fz3 : (116 * fz - 16) / LAB_KAPPA) * D50_WHITE[2],
  ];
  return xyzD65ToColor(multiply(D50_TO_D65, xyzD50), alpha);
};

export const colorToLch = (color: Color): Lch => {
  const { l, a, b } = colorToLab(color);
  const c = Math.hypot(a, b);
  const h = c < 1e-4 ? 0 : normalizeHue((Math.atan2(b, a) * 180) / Math.PI);
  return { l, c, h };
};

export const lchToColor = (lch: Lch, alpha: number): Color => {
  const hueRad = (lch.h * Math.PI) / 180;
  return labToColor(
    { l: lch.l, a: lch.c * Math.cos(hueRad), b: lch.c * Math.sin(hueRad) },
    alpha,
  );
};

export const colorToHsl = (color: Color): Hsl => {
  const { r, g, b } = color;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  return { h: normalizeHue(h * 60), s: s * 100, l: l * 100 };
};

export const hslToColor = (hsl: Hsl, alpha: number): Color => {
  const h = normalizeHue(hsl.h);
  const s = clamp(hsl.s / 100, 0, 1);
  const l = clamp(hsl.l / 100, 0, 1);
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number): number => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return { r: channel(0), g: channel(8), b: channel(4), alpha };
};

export const colorToHwb = (color: Color): Hwb => {
  const { h } = colorToHsl(color);
  const white = Math.min(color.r, color.g, color.b);
  const black = 1 - Math.max(color.r, color.g, color.b);
  return { h, w: white * 100, b: black * 100 };
};

export const hwbToColor = (hwb: Hwb, alpha: number): Color => {
  const white = clamp(hwb.w / 100, 0, 1);
  const black = clamp(hwb.b / 100, 0, 1);
  if (white + black >= 1) {
    const gray = white / (white + black);
    return { r: gray, g: gray, b: gray, alpha };
  }
  const base = hslToColor({ h: hwb.h, s: 100, l: 50 }, alpha);
  const apply = (channel: number): number =>
    channel * (1 - white - black) + white;
  return { r: apply(base.r), g: apply(base.g), b: apply(base.b), alpha };
};

export const colorToRgb255 = (color: Color): Rgb255 => ({
  r: clamp(color.r, 0, 1) * 255,
  g: clamp(color.g, 0, 1) * 255,
  b: clamp(color.b, 0, 1) * 255,
});

export const rgb255ToColor = (rgb: Rgb255, alpha: number): Color => ({
  r: clamp(rgb.r / 255, 0, 1),
  g: clamp(rgb.g / 255, 0, 1),
  b: clamp(rgb.b / 255, 0, 1),
  alpha,
});

export { clamp, normalizeHue };

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  const RED: Color = { r: 1, g: 0, b: 0, alpha: 1 };
  const WHITE: Color = { r: 1, g: 1, b: 1, alpha: 1 };
  const BLACK: Color = { r: 0, g: 0, b: 0, alpha: 1 };
  const TEAL: Color = { r: 94 / 255, g: 234 / 255, b: 212 / 255, alpha: 1 };

  const near = (actual: number, expected: number, tolerance = 1e-3): void => {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
  };
  const sameColor = (a: Color, b: Color, tolerance = 1e-3): void => {
    near(a.r, b.r, tolerance);
    near(a.g, b.g, tolerance);
    near(a.b, b.b, tolerance);
    near(a.alpha, b.alpha, tolerance);
  };

  describe('OKLCh（参照値: culori/CSS Color 4）', () => {
    it('赤の OKLCh は L0.628 C0.258 H29.23', () => {
      const { l, c, h } = colorToOklch(RED);
      near(l, 0.6279, 2e-3);
      near(c, 0.2577, 2e-3);
      near(h, 29.23, 0.2);
    });

    it('白の OKLab は L1 a0 b0', () => {
      const { l, a, b } = colorToOklab(WHITE);
      near(l, 1, 2e-3);
      near(a, 0, 2e-3);
      near(b, 0, 2e-3);
    });

    it('Color→OKLCh→Color は往復する', () => {
      sameColor(oklchToColor(colorToOklch(TEAL), 1), TEAL);
      sameColor(oklchToColor(colorToOklch(RED), 1), RED);
      sameColor(oklchToColor(colorToOklch(BLACK), 1), BLACK);
    });
  });

  describe('Lab/LCh（D50, 参照値: CSS Color 4）', () => {
    it('白の Lab は L100 a0 b0', () => {
      const { l, a, b } = colorToLab(WHITE);
      near(l, 100, 1e-2);
      near(a, 0, 1e-2);
      near(b, 0, 1e-2);
    });

    it('赤の Lab(D50) は L54.29 a80.81 b69.89', () => {
      const { l, a, b } = colorToLab(RED);
      near(l, 54.29, 0.1);
      near(a, 80.81, 0.2);
      near(b, 69.89, 0.2);
    });

    it('Color→Lab→Color / Color→LCh→Color は往復する', () => {
      sameColor(labToColor(colorToLab(TEAL), 1), TEAL);
      sameColor(lchToColor(colorToLch(TEAL), 1), TEAL);
    });
  });

  describe('HSL / HWB', () => {
    it('赤の HSL は h0 s100 l50', () => {
      const { h, s, l } = colorToHsl(RED);
      near(h, 0);
      near(s, 100);
      near(l, 50);
    });

    it('Color→HSL→Color は往復する', () => {
      sameColor(hslToColor(colorToHsl(TEAL), 1), TEAL);
    });

    it('Color→HWB→Color は往復する', () => {
      sameColor(hwbToColor(colorToHwb(TEAL), 1), TEAL);
    });

    it('白の HWB は w100 b0', () => {
      const { w, b } = colorToHwb(WHITE);
      near(w, 100);
      near(b, 0);
    });
  });

  describe('RGB255', () => {
    it('teal の RGB255 は 94,234,212', () => {
      const { r, g, b } = colorToRgb255(TEAL);
      near(r, 94, 0.5);
      near(g, 234, 0.5);
      near(b, 212, 0.5);
    });
  });
}
