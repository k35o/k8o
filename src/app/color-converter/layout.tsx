import { Heading } from '@/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'カラーコード職人',
  description: '色の表現方法を自由に変換できるツールです。',
  openGraph: {
    title: 'カラーコード職人',
    description: '色の表現方法を自由に変換できるツールです。',
    url: 'https://k8o.me/colors/converter',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'カラーコード職人',
    card: 'summary',
    description: '色の表現方法を自由に変換できるツールです。',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">カラーコード職人</Heading>
      {children}
    </div>
  );
}
