import { parseHTML } from 'linkedom';

export type Target = {
  readonly label: string;
  readonly path: string;
  readonly accept: string | null;
  readonly method: 'GET' | 'HEAD';
};

const MARKDOWN = 'text/markdown';

const PRODUCTION_ORIGIN = 'https://k8o.me';

const NOT_FOUND_PATH = '/compare-sites-not-found';
const NOT_FOUND_ARTICLE_PATH = '/blog/compare-sites-not-found';
const NOT_FOUND_TAG_PATH = '/tags/999999';
const NOT_FOUND_PLAYGROUND_PATH = '/playgrounds/compare-sites-not-found';

const ARTICLE_PATH = /^\/blog\/[a-z0-9-]+$/u;

const toPath = (url: string): string => {
  const { pathname, search } = new URL(url);
  return `${pathname}${search}`;
};

export const resolveOn = (origin: string, url: string): string => {
  const { pathname, search } = new URL(url, origin);
  return new URL(`${pathname}${search}`, origin).href;
};

export const parseSitemapPaths = (xml: string): string[] => {
  // linkedom の DOMParser は querySelectorAll の型が any なので、DOM の型が付く parseHTML で読む。
  // loc の中身は HTML として読んでも変わらない
  const { document } = parseHTML(xml);
  const paths = [...document.querySelectorAll('loc')].map((loc) =>
    toPath(loc.textContent.trim()),
  );
  return [...new Set(paths)];
};

export const isProductionOrigin = (url: string): boolean =>
  new URL(url).origin === PRODUCTION_ORIGIN;

const page = (path: string): Target => ({
  label: path,
  path,
  accept: null,
  method: 'GET',
});

const markdownOf = (path: string): Target => ({
  ...page(path),
  label: `${path} (Accept: ${MARKDOWN})`,
  accept: MARKDOWN,
});

const headOf = (path: string): Target => ({
  ...page(path),
  label: `HEAD ${path}`,
  method: 'HEAD',
});

const articleTargets = (path: string): Target[] => [
  page(path),
  page(`${path}.md`),
  headOf(`${path}.md`),
  markdownOf(path),
];

const fixedTargets = (): Target[] => [
  page('/sitemap.xml'),
  page('/robots.txt'),
  page('/manifest.webmanifest'),
  page('/llms.txt'),
  page('/blog/feed'),
  markdownOf('/blog/feed'),
  page('/slides/feed'),
  page('/reading-list/feed'),
  page('/reading-list/feed?utm=1'),
  page('/notifications'),
  page('/favicon.ico'),
  page('/icon.png'),
  page('/apple-icon.png'),
  page('/icon-192.png'),
  page('/badge-72.png'),
  page('/sw.js'),
  page('/ga-init.js'),
  page('/playgrounds/shared-worker.worker.js'),
  page('/playgrounds/media-pseudos-tone.wav'),
  page('/_vercel/speed-insights/script.js'),
];

export const buildTargets = (sitemapPaths: readonly string[]): Target[] => {
  const firstArticle = sitemapPaths.find((path) => ARTICLE_PATH.test(path));
  const targets = [
    ...fixedTargets(),
    markdownOf('/'),
    page(NOT_FOUND_PATH),
    markdownOf(NOT_FOUND_PATH),
    ...articleTargets(NOT_FOUND_ARTICLE_PATH),
    page(NOT_FOUND_TAG_PATH),
    page(NOT_FOUND_PLAYGROUND_PATH),
    page('/about/'),
    page('/about/?x=1'),
    ...(firstArticle === undefined ? [] : [page(`${firstArticle}/`)]),
    ...sitemapPaths.flatMap((path) =>
      ARTICLE_PATH.test(path) ? articleTargets(path) : [page(path)],
    ),
  ];
  return [...new Map(targets.map((target) => [target.label, target])).values()];
};

export const filterTargets = (
  targets: readonly Target[],
  patterns: readonly RegExp[],
): Target[] =>
  patterns.length === 0
    ? [...targets]
    : targets.filter((target) =>
        patterns.some((pattern) => pattern.test(target.path)),
      );
