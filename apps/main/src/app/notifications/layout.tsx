import { Heading } from '@k8o/arte-odyssey';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

const description =
  'ReadingsとBrowser Supportの更新をプッシュ通知で受け取れます。受け取った通知の履歴も確認できます。';

export const metadata = buildPageMetadata({
  title: '通知',
  description,
  path: '/notifications',
});

export default function Layout({ children }: LayoutProps<'/notifications'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-8">
        <Heading level="h2">通知</Heading>
        {children}
      </div>
    </div>
  );
}
