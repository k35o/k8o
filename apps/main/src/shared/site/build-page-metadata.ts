import type { Metadata } from 'next';

type PageMetadataInput<T extends string, D extends string> = {
  title: T;
  description: D;
  // ルート相対パス。絶対URLはroot layoutのmetadataBaseが解決する。
  path: string;
  // 生成OG画像を大きく見せたいページだけ large にする
  twitterCard?: 'summary' | 'summary_large_image';
  // フィードを持つ一覧ページだけ RSS の alternate を出す
  rssFeedPath?: string;
};

// ツール・一覧ページ共通のmetadata定型。ページ固有の差分（タイトル・説明・パス）
// だけを受け取り、openGraph / twitter への転記をここに集約する。
// title / description の literal 型を保つのは、feed route が layout の metadata
// から文字列を読み直すため。
export const buildPageMetadata = <T extends string, D extends string>({
  title,
  description,
  path,
  twitterCard = 'summary',
  rssFeedPath,
}: PageMetadataInput<T, D>): Metadata & { title: T; description: D } => ({
  title,
  description,
  ...(rssFeedPath === undefined
    ? {}
    : {
        alternates: {
          types: {
            'application/rss+xml': rssFeedPath,
          },
        },
      }),
  openGraph: {
    title,
    description,
    url: path,
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title,
    card: twitterCard,
    description,
  },
});
