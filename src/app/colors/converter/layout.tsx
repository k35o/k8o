import { Heading } from '@/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: '色変換ツール',
  description: 'カラーコードの形式を変換します',
  openGraph: {
    title: '色変換ツール',
    description: 'カラーコードの形式を変換します',
    url: 'https://k8o.me/colors/converter',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: '色変換ツール',
    card: 'summary',
    description: 'カラーコードの形式を変換します',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h3">色変換ツール</Heading>
      {children}
    </div>
  );
}
