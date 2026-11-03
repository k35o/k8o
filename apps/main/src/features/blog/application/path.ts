import { join } from 'node:path';

import { CONTENT_DIR } from '@/shared/site/content-dir';

// パストラバーサル対策: slug をファイルパスに渡す前に厳格に検証する。
// %2F デコードで `../` 脱出を許さないよう、英小文字・数字・ハイフンのみ許可。
const SLUG_RE = /^[a-z0-9-]+$/u;

export const blogPath = (slug: string): string => {
  if (!SLUG_RE.test(slug)) {
    throw new Error(`Invalid slug: ${slug}`);
  }
  return join(CONTENT_DIR, `blog/${slug}/article.mdx`);
};
