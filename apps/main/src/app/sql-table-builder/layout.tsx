import { Heading } from '@k8o/arte-odyssey/heading';
import { Suspense } from 'react';

export const metadata = {
  title: 'SQLテーブルメーカー',
  description: 'データベースのテーブルを作成するSQL文を発行します。',
  openGraph: {
    title: 'SQLテーブルメーカー',
    description: 'データベースのテーブルを作成するSQL文を発行します。',
    url: 'https://k8o.me/sql-table-builder',
  },
  twitter: {
    title: 'SQLテーブルメーカー',
    card: 'summary',
    description: 'データベースのテーブルを作成するSQL文を発行します。',
  },
};

export default function Layout({
  children,
}: LayoutProps<'/sql-table-builder'>) {
  return (
    <div className="flex flex-col gap-4">
      <Heading type="h2">SQLテーブルメーカー</Heading>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}
