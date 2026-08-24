import { Heading } from '@k8o/arte-odyssey';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import { RssLink } from './_components/rss-link';

export const metadata = buildPageMetadata({
  title: 'Readings',
  description: '気になっている記事を集めて、あとから探せるようにしています。',
  path: '/reading-list',
  rssFeedPath: '/reading-list/feed',
});

export default function Layout({ children }: LayoutProps<'/reading-list'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Heading level="h2">Readings</Heading>
          <RssLink />
        </div>
        {children}
      </div>
    </div>
  );
}
