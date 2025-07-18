import { Heading } from '@k8o/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'Talks',
  description:
    '過去の登壇内容をまとめたページです。講演のテーマや資料へのリンクを掲載しています。',
  openGraph: {
    title: 'Talks',
    description:
      '過去の登壇内容をまとめたページです。講演のテーマや資料へのリンクを掲載しています。',
    url: 'https://k8o.me/talks',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Talks',
    card: 'summary',
    description:
      '過去の登壇内容をまとめたページです。講演のテーマや資料へのリンクを掲載しています。',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-6">
      <Heading type="h2">Talks</Heading>
      {children}
    </div>
  );
}
