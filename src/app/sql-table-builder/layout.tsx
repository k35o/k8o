import { Heading } from '@/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'SQLテーブルメーカー',
  description:
    'データベーステーブルの作成用SQL分を簡単に生成するツールです。',
  openGraph: {
    title: 'SQLテーブルメーカー',
    description:
      'データベーステーブルの作成用SQL分を簡単に生成するツールです。',
    url: 'https://k8o.me/sql-table-builder',
  },
  twitter: {
    title: 'SQLテーブルメーカー',
    card: 'summary',
    description:
      'データベーステーブルの作成用SQL分を簡単に生成するツールです。',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-4">
      <Heading type="h2">SQLテーブルメーカー</Heading>
      {children}
    </div>
  );
}
