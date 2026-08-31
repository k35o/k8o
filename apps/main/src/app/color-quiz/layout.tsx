import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

export const metadata = buildPageMetadata({
  title: 'カラーHexクイズ',
  description: '色からHexコードを当てたり、Hexコードから色を選ぶクイズです。',
  path: '/color-quiz',
});

export default function Layout({ children }: LayoutProps<'/color-quiz'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex h-full flex-col gap-4">
        <Heading level="h2">カラーHexクイズ</Heading>
        {children}
      </div>
    </div>
  );
}
