import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

export const metadata = buildPageMetadata({
  title: 'Talks',
  description: '過去の登壇テーマや資料へのリンクをまとめています。',
  path: '/talks',
});

export default function Layout({ children }: LayoutProps<'/talks'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-6">
        <Heading level="h2">Talks</Heading>
        {children}
      </div>
    </div>
  );
}
