export type SmokeTarget = {
  readonly path: string;
  readonly expectedStatus: number;
};

const NOT_FOUND_PATH = '/smoke-pages-not-found';

export const smokeTargets = (
  sitemapPaths: readonly string[],
  patterns: readonly RegExp[],
): SmokeTarget[] =>
  [
    ...sitemapPaths.map((path) => ({ path, expectedStatus: 200 })),
    { path: NOT_FOUND_PATH, expectedStatus: 404 },
  ].filter(
    ({ path }) =>
      patterns.length === 0 || patterns.some((pattern) => pattern.test(path)),
  );
