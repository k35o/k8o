import { cacheLife } from 'next/cache';

import { playgroundSections } from '@/app/_components/playgrounds';
import { getBlogContents } from '@/features/blog/interface/queries';
import { getTalks } from '@/features/talks/interface/queries';
import { siteEntries } from '@/shared/site/site-entries';

const SITE_URL = 'https://k8o.me';

export async function generateLlmsContent(): Promise<string> {
  'use cache';
  cacheLife('max');

  const [blogs, talks] = await Promise.all([getBlogContents(), getTalks()]);

  const blogContent = blogs
    .map((blog) => {
      const url = `${SITE_URL}/blog/${blog.slug}`;
      const date = new Date(blog.createdAt).toISOString().slice(0, 10);
      const tags =
        blog.tags.length > 0 ? `\nタグ: ${blog.tags.join(', ')}` : '';
      const description =
        blog.description === null ? '' : `\n${blog.description}`;
      return `#### [${blog.title}](${url})（${date}）${description}${tags}`;
    })
    .join('\n\n');

  const talkContent = talks
    .map((talk) => {
      const links = talk.slideUrl
        ? `[イベント](${talk.eventUrl}) / [スライド](${talk.slideUrl})`
        : `[イベント](${talk.eventUrl})`;
      return `#### ${talk.title}\n${talk.eventName}（${talk.eventDate}）\n${links}`;
    })
    .join('\n\n');

  const playgroundContent = playgroundSections
    .map((section) => {
      const url = `${SITE_URL}/playgrounds/${section.id}`;
      return `#### [${section.title}](${url})\n${section.description}`;
    })
    .join('\n\n');

  const dynamicContent = new Map<string, string>([
    ['/blog', blogContent],
    ['/talks', talkContent],
    ['/playgrounds', playgroundContent],
  ]);

  const entriesContent = siteEntries
    .map((entry) => {
      const url = entry.link.startsWith('https://')
        ? entry.link
        : `${SITE_URL}${entry.link}`;
      const base = `### [${entry.title}](${url})\n${entry.description}`;
      const sub = dynamicContent.get(entry.link);
      return sub === undefined ? base : `${base}\n\n${sub}`;
    })
    .join('\n\n');

  return `# k8o
WebフロントエンドとTypeScriptが好きで、Web標準の進化を追いながら楽しんでいます。
デザインシステムの構築を通じて、デザインとフロントエンドの交差点を探っています。

## このサイトの使いどころ
k8o.me は k8o（Webフロントエンドエンジニア）の個人サイトです。次の用途で参照してください。

- Webフロントエンドやブラウザの新機能（CSS・HTML・JavaScript・Web API）についての日本語の解説記事を探す → [Blog](${SITE_URL}/blog)
- k8o の人物・活動・連絡手段を確認する → [About](${SITE_URL}/about) / [Contact](${SITE_URL}/contact)
- 色変換・コントラスト比計算などのWeb開発向けツールを使う → 下記ページ一覧の Tools

各ブログ記事は URL の末尾に \`.md\` を付ける（例: ${SITE_URL}/blog/example.md）か、\`Accept: text/markdown\` ヘッダを付けてリクエストすると Markdown 形式で取得できます。

## ページ一覧
${entriesContent}

## サイト情報
- [About](${SITE_URL}/about) — k8o とこのサイトについて
- [Contact](${SITE_URL}/contact) — 連絡手段
- [Privacy](${SITE_URL}/privacy) — プライバシーポリシー

## 開発者向けリソース
- [GitHub: k35o/k8o](https://github.com/k35o/k8o) — このサイトのソースコード
- [@k8ordo/ui](https://www.npmjs.com/package/@k8ordo/ui) — k8o が開発するデザインシステム（npm: \`@k8ordo/ui\`）
- [@k8o/create](https://www.npmjs.com/package/@k8o/create) — Vite+ プロジェクトジェネレータ（npm: \`@k8o/create\`）
`;
}
