export type SmokeTarget = {
  readonly path: string;
  readonly expectedStatus: number;
  readonly checksNavigation: boolean;
};

const NOT_FOUND_PATH = '/smoke-pages-not-found';
const NAVIGATION_START_PATH = '/';

const targetOf = (path: string, expectedStatus: number): SmokeTarget => ({
  path,
  expectedStatus,
  checksNavigation: path === NAVIGATION_START_PATH,
});

export const smokeTargets = (
  sitemapPaths: readonly string[],
  patterns: readonly RegExp[],
): SmokeTarget[] =>
  [
    ...sitemapPaths.map((path) => targetOf(path, 200)),
    targetOf(NOT_FOUND_PATH, 404),
  ].filter(
    ({ path }) =>
      patterns.length === 0 || patterns.some((pattern) => pattern.test(path)),
  );
