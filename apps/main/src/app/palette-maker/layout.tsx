import { Heading } from '@k8o/arte-odyssey';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

export const metadata = buildPageMetadata({
  title: 'いろばしご',
  description:
    'OKLCHの明度スケールで11段階のカラーパレットを生成し、コントラストを検証します。',
  path: '/palette-maker',
});

export default function Layout({ children }: LayoutProps<'/palette-maker'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex h-full flex-col gap-4">
        <Heading level="h2">いろばしご</Heading>
        {children}
      </div>
    </div>
  );
}
