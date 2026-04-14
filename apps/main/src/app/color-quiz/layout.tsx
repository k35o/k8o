import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

export const metadata = {
  title: 'カラーHexクイズ',
  description: '色からHexコードを当てたり、Hexコードから色を選ぶクイズです。',
  openGraph: {
    title: 'カラーHexクイズ',
    description: '色からHexコードを当てたり、Hexコードから色を選ぶクイズです。',
    url: 'https://k8o.me/color-quiz',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'カラーHexクイズ',
    card: 'summary',
    description: '色からHexコードを当てたり、Hexコードから色を選ぶクイズです。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/color-quiz'>) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">カラーHexクイズ</Heading>
      {children}
    </div>
  );
}
