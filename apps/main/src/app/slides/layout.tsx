import { Heading } from '@k8o/arte-odyssey';
import Link from 'next/link';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

export const metadata = buildPageMetadata({
  title: 'Slides',
  description: '登壇や発表で使ったスライドをまとめています。',
  path: '/slides',
  rssFeedPath: '/slides/feed',
});

export default function Layout({ children }: LayoutProps<'/slides'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-6">
        <Link className="hover:underline" href="/slides">
          <Heading level="h2">Slides</Heading>
        </Link>
        {children}
      </div>
    </div>
  );
}
