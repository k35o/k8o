import type { VercelRoute } from '@k8ordo/framework/vercel';

import { ARTICLE, SLUG } from './patterns.ts';
import { SECURITY_HEADERS } from './security-headers.ts';

const ACCEPTS_MARKDOWN = [
  { type: 'header', key: 'accept', value: '.*text/markdown.*' },
] as const;

// Vercel は既定で大文字と小文字を区別しない。/Blog などは 404 にするので、記事とフィードに
// 当てる規則は caseSensitive にする
export const BEFORE_FILES: readonly VercelRoute[] = [
  // Cache-Control は assets の immutable まで上書きするので、ここには置かない
  { src: '^/.*$', headers: SECURITY_HEADERS, continue: true },
  // 空の区間を許さないので、//evil.test/ を外のオリジンへ送らない
  {
    src: '^/((?:[^/]+/)*[^/]+)/$',
    status: 308,
    headers: { Location: '/$1' },
  },
  // Accept で出し分ける URL（/ と記事）だけに付ける
  {
    src: `^/(?:blog/${ARTICLE})?$`,
    headers: { Vary: 'Accept' },
    continue: true,
    caseSensitive: true,
  },
  {
    src: '^/reading-list/feed$',
    headers: {
      // 2026-04-06 より前に作った Vercel のプロジェクトは、外への rewrite の応答を、
      // このヘッダーが無いとキャッシュせず、毎回 api に届ける
      'x-vercel-enable-rewrite-caching': '1',
      // api の CDN は s-maxage・stale-while-revalidate・stale-if-error を外して返すので、
      // こちらの CDN での寿命はここで決める。CDN-Cache-Control と違い、こちらの CDN が
      // 使って取り除くので、リーダーや途中の共有キャッシュには届かない
      'Vercel-CDN-Cache-Control':
        'max-age=3600, stale-while-revalidate=86400, stale-if-error=86400',
    },
    continue: true,
    caseSensitive: true,
  },
  {
    src: `^/blog/(${SLUG})\\.md$`,
    dest: '/blog/$1/article.md',
    check: true,
    caseSensitive: true,
  },
  {
    src: `^/blog/(${ARTICLE})$`,
    has: ACCEPTS_MARKDOWN,
    dest: '/blog/$1/article.md',
    check: true,
    caseSensitive: true,
  },
  { src: '^/$', has: ACCEPTS_MARKDOWN, dest: '/index.md', check: true },
];

export const BEFORE_NOT_FOUND: readonly VercelRoute[] = [
  {
    src: '^/reading-list/feed$',
    dest: 'https://api.k8o.me/public/reading-list/feed',
    caseSensitive: true,
  },
  // ここに来るのは 404 だけで、HTML の 404 も markdown の 404 も Accept で変わる
  { src: '^/.*$', headers: { Vary: 'Accept' }, continue: true },
  {
    src: '^/.*$',
    has: ACCEPTS_MARKDOWN,
    dest: '/not-found.md',
    status: 404,
  },
  // check の書き換えが外れた /blog/<未知>.md は、書き換えたあとのパスでここに来る
  {
    src: `^/blog/${SLUG}/article\\.md$`,
    dest: '/not-found.md',
    status: 404,
  },
];
