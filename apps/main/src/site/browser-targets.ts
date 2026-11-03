// build.target（esbuild の名前）と Lightning CSS には Android の Chrome・Firefox の名前が無く、
// デスクトップの名前で数える。フロアの2つの版は、低いほうにそろえる
const TARGET_NAMES = [
  ['chrome', 'chrome', 'chrome'],
  ['chrome_android', 'chrome', 'chrome'],
  ['edge', 'edge', 'edge'],
  ['firefox', 'firefox', 'firefox'],
  ['firefox_android', 'firefox', 'firefox'],
  ['safari', 'safari', 'safari'],
  ['safari_ios', 'ios', 'ios_saf'],
] as const;

type Floor = Readonly<Record<(typeof TARGET_NAMES)[number][0], string>>;

type BrowserTargets = {
  build: string[];
  lightningcss: Record<string, number>;
};

// Lightning CSS は版を major << 16 | minor << 8 | patch の数で受け取る
const encode = (version: string): number => {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);
  return (major << 16) | (minor << 8) | patch;
};

export const browserTargets = (floor: Floor): BrowserTargets => {
  const lowest = new Map<
    string,
    { version: string; lightningcss: string; encoded: number }
  >();
  for (const [browser, build, lightningcss] of TARGET_NAMES) {
    const version = floor[browser];
    const encoded = encode(version);
    const current = lowest.get(build);
    if (current === undefined || encoded < current.encoded) {
      lowest.set(build, { version, lightningcss, encoded });
    }
  }
  return {
    build: [...lowest].map(([build, { version }]) => `${build}${version}`),
    lightningcss: Object.fromEntries(
      [...lowest.values()].map(({ lightningcss, encoded }) => [
        lightningcss,
        encoded,
      ]),
    ),
  };
};
