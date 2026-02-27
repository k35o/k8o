import { Heading } from '@k8o/arte-odyssey/heading';
import type { Metadata } from 'next';

export const metadata = {
  title: 'もじカウント',
  description: 'テキストの文字数をリアルタイムに数えます。',
  openGraph: {
    title: 'もじカウント',
    description: 'テキストの文字数をリアルタイムに数えます。',
    url: 'https://k8o.me/moji-count',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'もじカウント',
    card: 'summary',
    description: 'テキストの文字数をリアルタイムに数えます。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/moji-count'>) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">もじカウント</Heading>
      {children}
    </div>
  );
}
