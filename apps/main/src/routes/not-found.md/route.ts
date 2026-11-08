import { SITE_URL } from '@/shared/site/site-url';

const content = `# 404 Not Found

お探しのページは存在しません。次のリンクから目的のコンテンツを探せます。

- [トップページ](${SITE_URL}/)
- [サイト全体の索引（llms.txt）](${SITE_URL}/llms.txt)
- [サイトマップ](${SITE_URL}/sitemap.xml)
- [ブログ一覧](${SITE_URL}/blog)

各ブログ記事は URL の末尾に \`.md\` を付けると Markdown 形式で取得できます。
`;

// static のビルドは 200 の GET しかファイルに書かない。404 の状態は vercel() の規則が付ける
export function GET(): Response {
  return new Response(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
