import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

import { RssLink } from './_components/rss-link';

export const metadata = {
  title: 'Readings',
  description: '気になっている記事を集めて、あとから探せるようにしています。',
  openGraph: {
    title: 'Readings',
    description: '気になっている記事を集めて、あとから探せるようにしています。',
    url: 'https://k8o.me/reading-list',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Readings',
    card: 'summary',
    description: '気になっている記事を集めて、あとから探せるようにしています。',
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://k8o.me/reading-list/feed',
    },
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/reading-list'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Heading type="h2">Readings</Heading>
          <RssLink />
        </div>
        {children}
      </div>
    </div>
  );
}
