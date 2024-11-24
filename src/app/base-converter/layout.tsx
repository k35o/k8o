import { Heading } from '@/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: '基数チェンジャー',
  description: '整数を簡単に異なる進数表現に変換するツールです。',
  openGraph: {
    title: '基数チェンジャー',
    description: '整数を簡単に異なる進数表現に変換するツールです。',
    url: 'https://k8o.me/number/converter',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: '基数チェンジャー',
    card: 'summary',
    description: '整数を簡単に異なる進数表現に変換するツールです',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">基数チェンジャー</Heading>
      {children}
    </div>
  );
}
