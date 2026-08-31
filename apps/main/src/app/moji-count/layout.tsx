import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

export const metadata = buildPageMetadata({
  title: 'もじカウント',
  description: 'テキストの文字数をリアルタイムに数えます。',
  path: '/moji-count',
});

export default function Layout({ children }: LayoutProps<'/moji-count'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex h-full flex-col gap-4">
        <Heading level="h2">もじカウント</Heading>
        {children}
      </div>
    </div>
  );
}
