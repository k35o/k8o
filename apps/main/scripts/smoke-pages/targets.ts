export type SmokeTarget = {
  readonly path: string;
  readonly expectedStatus: number;
  readonly checksNavigation: boolean;
  readonly takesScreenshot: boolean;
};

const NOT_FOUND_PATH = '/smoke-pages-not-found';
const NAVIGATION_START_PATH = '/';
// 代表のページ: トップ、数式の記事、コードの多い記事、Playground を埋めた記事、スライド、ツール、404
const SCREENSHOT_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/blog/font-family-math',
  '/blog/react19-usereducer-ts-type-inference',
  '/blog/alpha-function',
  '/slides/sample-deck',
  '/artifacts',
  '/color-converter',
  '/color-quiz',
  '/contrast-checker',
  '/html-nest',
  '/moji-count',
  '/palette-maker',
  '/radius-maker',
  NOT_FOUND_PATH,
]);

const targetOf = (path: string, expectedStatus: number): SmokeTarget => ({
  path,
  expectedStatus,
  checksNavigation: path === NAVIGATION_START_PATH,
  takesScreenshot: SCREENSHOT_PATHS.has(path),
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
