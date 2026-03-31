import { Heading, IconLink, RSSIcon } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

export const metadata = {
  title: 'よんでるもの',
  description: '普段読んでいる記事を検索やソースで絞り込みながら探せます。',
  openGraph: {
    title: 'よんでるもの',
    description: '普段読んでいる記事を検索やソースで絞り込みながら探せます。',
    url: 'https://k8o.me/reading-list',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'よんでるもの',
    card: 'summary',
    description: '普段読んでいる記事を検索やソースで絞り込みながら探せます。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/reading-list'>) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Heading type="h2">よんでるもの</Heading>
          <p className="text-fg-mute text-sm">普段読んでいる記事たち</p>
        </div>
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
