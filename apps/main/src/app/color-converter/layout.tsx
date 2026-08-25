import { Heading } from '@k8o/arte-odyssey';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

export const metadata = buildPageMetadata({
  title: 'カラーコード職人',
  description:
    'HEX・RGB・HSL・HWB・OKLCH・OKLAB・LCH・LABを相互に変換します。どの形式でも貼り付けでき、スライダーで微調整できます。',
  path: '/color-converter',
});

export default function Layout({ children }: LayoutProps<'/color-converter'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex h-full flex-col gap-4">
        <Heading level="h2">カラーコード職人</Heading>
        {children}
      </div>
    </div>
  );
}
