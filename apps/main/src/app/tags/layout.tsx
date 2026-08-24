import { Heading, TagIcon } from '@k8o/arte-odyssey';
import Link from 'next/link';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

export const metadata = buildPageMetadata({
  title: 'Tags',
  description:
    'k8oで提供するサービスやブログのタグ一覧をまとめたページです。各タグの関連するコンテンツへのリンクを掲載しています。',
  path: '/tags',
});

export default function Layout({ children }: LayoutProps<'/tags'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Link href="/tags">
            <Heading level="h2">
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
    </div>
  );
}
