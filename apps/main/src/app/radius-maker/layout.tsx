import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

export const metadata = buildPageMetadata({
  title: 'かどまるラボ',
  description: 'border-radiusを視覚的に操作してCSSを生成します。',
  path: '/radius-maker',
});

export default function Layout({ children }: LayoutProps<'/radius-maker'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex h-full flex-col gap-4">
        <Heading level="h2">かどまるラボ</Heading>
        {children}
      </div>
    </div>
  );
}
