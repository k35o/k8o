import { Heading } from '@k8o/arte-odyssey/heading';
import type { Metadata } from 'next';

export const metadata = {
  title: 'テキスト差分チェッカー',
  description: '2つのテキストを文字単位で比較して差分を表示します。',
  openGraph: {
    title: 'テキスト差分チェッカー',
    description: '2つのテキストを文字単位で比較して差分を表示します。',
    url: 'https://k8o.me/text-diff',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'テキスト差分チェッカー',
    card: 'summary',
    description: '2つのテキストを文字単位で比較して差分を表示します。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/text-diff'>) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">テキスト差分チェッカー</Heading>
      {children}
    </div>
  );
}
