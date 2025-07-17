import { Heading } from '@k8o/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'カラーコード職人',
  description: 'RGBとHEXのように、特定の色の異なる表現を確認します。',
  openGraph: {
    title: 'カラーコード職人',
    description:
      'RGBとHEXのように、特定の色の異なる表現を確認します。',
    url: 'https://k8o.me/color-converter',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'カラーコード職人',
    card: 'summary',
    description:
      'RGBとHEXのように、特定の色の異なる表現を確認します。',
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
