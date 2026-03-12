import { Heading } from '@k8o/arte-odyssey/heading';
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
      <Heading type="h2">よんでるもの</Heading>
      {children}
    </div>
  );
}
