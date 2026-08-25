import { NextResponse } from 'next/server';

const content = `# 404 Not Found

お探しのページは存在しません。次のリンクから目的のコンテンツを探せます。

- [トップページ](https://k8o.me/)
- [サイト全体の索引（llms.txt）](https://k8o.me/llms.txt)
- [サイトマップ](https://k8o.me/sitemap.xml)
- [ブログ一覧](https://k8o.me/blog)

各ブログ記事は URL の末尾に \`.md\` を付けると Markdown 形式で取得できます。
`;

export function GET() {
  return new NextResponse(content, {
    status: 404,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // 未知のパスは Accept で HTML と markdown の 404 を出し分けるため、
      // 共有キャッシュが Accept をキーに含むよう明示する
      Vary: 'Accept',
    },
  });
}
