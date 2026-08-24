import { Heading } from '@k8o/arte-odyssey';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

export const metadata = buildPageMetadata({
  title: 'コントラストチェッカー',
  description:
    '2色のコントラスト比とAPCAのLc値を計算し、WCAGの基準で評価します。',
  path: '/contrast-checker',
});

export default function Layout({ children }: LayoutProps<'/contrast-checker'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex h-full flex-col gap-4">
        <Heading level="h2">コントラストチェッカー</Heading>
        {children}
      </div>
    </div>
  );
}
