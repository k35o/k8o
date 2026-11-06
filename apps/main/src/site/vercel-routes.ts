import type { VercelRoute } from '@k8ordo/framework/vercel';

import { ARTICLE, SLUG } from './patterns.ts';
import { securityHeaders } from './security-headers.ts';
import type { DeployTarget } from './security-headers.ts';

const ACCEPTS_MARKDOWN = [
  { type: 'header', key: 'accept', value: '.*text/markdown.*' },
] as const;

// 転送の Location に入れる区間は、空のものと「\」・制御文字・空白を含むものを許さない。
// いまの Vercel は // をまとめ、src を %xx のままのパスに当てるが、デコードしたパスに当てる日が来ても、
// ブラウザが //evil.test と読む Location（//evil.test・/\evil.test・/<TAB>/evil.test）を作らない
const SEGMENT = String.raw`[^/\\\x00-\x20\x7f]+`;
const PATH_TO_REDIRECT = `((?:${SEGMENT}/)*${SEGMENT})`;

// Vercel は既定で大文字と小文字を区別しない。/Blog などは 404 にするので、記事とフィードに
// 当てる規則は caseSensitive にする
export const beforeFiles = (
  environment: DeployTarget,
): readonly VercelRoute[] => [
  // Cache-Control は assets の immutable まで上書きするので、ここには置かない
  { src: '^/.*$', headers: securityHeaders(environment), continue: true },
  {
    src: `^/${PATH_TO_REDIRECT}/$`,
    status: 308,
    headers: { Location: '/$1' },
  },
  { src: '^/index\\.html$', status: 308, headers: { Location: '/' } },
  {
    src: `^/${PATH_TO_REDIRECT}/index\\.html$`,
    status: 308,
    headers: { Location: '/$1' },
  },
  { src: '^/404\\.html$', dest: '/404.html', status: 404 },
  // 下の書き換えより前に置くので、書き換えの行き先（/index.md）には当たらない。
  // /blog/<slug>/article.md は記事の「Markdownをコピー」が取るので、名前のまま開かせる。
  // vite dev は /blog/<slug>.md の書き換えを当てないので、ボタンは公開の URL を取れない
  { src: '^/(?:index|not-found)\\.md$', dest: '/not-found.md', status: 404 },
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
      // フィードは外のサイトの題や説明を k8o.me の origin で返す。WebKit は rss+xml を XML として
      // 読み、XHTML の script を動かすので、何も読ませない。同じ名前の頭は後の規則の値で置き換わるので、
      // default-src の効かない指示子もここで書く
      'Content-Security-Policy':
        "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; report-to csp-endpoint",
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
  // 404 は HTML も markdown も Accept で変わる。Vercel は上の feed の書き換えの応答にもこの頭を
  // 付けるが、feed は中身が Accept で変わらず、CDN の cache が Accept ごとに分かれるだけ
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
