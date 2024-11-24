import { Heading } from '@/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'もじカウント',
  description:
    'テキストの文字数を簡単かつ正確にカウントできるシンプルなツールです。日本語、英語、記号、絵文字、テキストの種類を問わず分析できます。',
  openGraph: {
    title: 'もじカウント',
    description:
      'テキストの文字数を簡単かつ正確にカウントできるシンプルなツールです。日本語、英語、記号、絵文字、テキストの種類を問わず分析できます。',
    url: 'https://k8o.me/moji-count',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'もじカウント',
    card: 'summary',
    description:
      'テキストの文字数を簡単かつ正確にカウントできるシンプルなツールです。日本語、英語、記号、絵文字、テキストの種類を問わず分析できます。',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">もじカウント</Heading>
      {children}
    </div>
  );
}
