import { Heading } from '@k8o/arte-odyssey/heading';
import { IconLink } from '@k8o/arte-odyssey/icon-link';
import { RSSIcon } from '@k8o/arte-odyssey/icons';
import type { Metadata } from 'next';

export const metadata = {
  title: 'よんでるもの',
  description: '普段読んでいる記事をまとめたページ。',
  openGraph: {
    title: 'よんでるもの',
    description: '普段読んでいる記事をまとめたページ。',
    url: 'https://k8o.me/reading-list',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'よんでるもの',
    card: 'summary',
    description: '普段読んでいる記事をまとめたページ。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/reading-list'>) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading type="h2">よんでるもの</Heading>
        <IconLink
          bg="base"
          href="/reading-list/feed"
          label="RSSフィード"
          openInNewTab
        >
          <RSSIcon />
        </IconLink>
      </div>
      {children}
    </div>
  );
}
