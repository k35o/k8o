import { Heading } from '@k8o/arte-odyssey/heading';
import { TagIcon } from '@k8o/arte-odyssey/icons';
import Link from 'next/link';

export const metadata = {
  title: 'Tags',
  description:
    'k8oで提供するサービスやブログのタグ一覧をまとめたページです。各タグの関連するコンテンツへのリンクを掲載しています。',
  openGraph: {
    title: 'Tags',
    description:
      'k8oで提供するサービスやブログのタグ一覧をまとめたページです。各タグの関連するコンテンツへのリンクを掲載しています。',
    url: 'https://k8o.me/tags',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Tags',
    card: 'summary',
    description:
      'k8oで提供するサービスやブログのタグ一覧をまとめたページです。各タグの関連するコンテンツへのリンクを掲載しています。',
  },
};

export default function Layout({ children }: LayoutProps<'/tags'>) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link href="/tags">
          <Heading type="h2">
            <span className="flex items-center gap-1">
              <span className="text-primary-fg">
                <TagIcon />
              </span>
              タグ置き場
            </span>
          </Heading>
        </Link>
        <p>
          k8oで提供するサービスやブログのタグをまとめました。各タグを利用するコンテンツを確認できます。
        </p>
      </div>
      {children}
    </div>
  );
}
