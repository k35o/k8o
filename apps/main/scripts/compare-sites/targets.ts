import { parseHTML } from 'linkedom';

export type Target = {
  readonly label: string;
  readonly path: string;
  readonly accept: string | null;
};

const MARKDOWN = 'text/markdown';

const FIXED_PATHS = [
  '/sitemap.xml',
  '/robots.txt',
  '/manifest.webmanifest',
  '/llms.txt',
  '/md/home',
  '/blog/feed',
  '/slides/feed',
  '/reading-list/feed',
  '/notifications',
  '/favicon.ico',
  '/icon.png',
  '/apple-icon.png',
  '/icon-192.png',
  '/badge-72.png',
  '/sw.js',
  '/ga-init.js',
  '/playgrounds/shared-worker.worker.js',
  '/playgrounds/media-pseudos-tone.wav',
] as const;

const NOT_FOUND_PATH = '/compare-sites-not-found';
const NOT_FOUND_ARTICLE_PATH = '/blog/compare-sites-not-found';

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

const page = (path: string): Target => ({ label: path, path, accept: null });

const markdownOf = (path: string): Target => ({
  label: `${path} (Accept: ${MARKDOWN})`,
  path,
  accept: MARKDOWN,
});

const articleTargets = (path: string): Target[] => [
  page(path),
  page(`${path}.md`),
  markdownOf(path),
];

export const buildTargets = (sitemapPaths: readonly string[]): Target[] => {
  const firstArticle = sitemapPaths.find((path) => ARTICLE_PATH.test(path));
  const targets = [
    ...FIXED_PATHS.map((path) => page(path)),
    markdownOf('/'),
    page(NOT_FOUND_PATH),
    markdownOf(NOT_FOUND_PATH),
    ...articleTargets(NOT_FOUND_ARTICLE_PATH),
    page('/about/'),
    ...(firstArticle === undefined ? [] : [page(`${firstArticle}/`)]),
    ...sitemapPaths.flatMap((path) =>
      ARTICLE_PATH.test(path) ? articleTargets(path) : [page(path)],
    ),
  ];
  return [...new Map(targets.map((target) => [target.label, target])).values()];
};
