import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContentContainer } from '@/app/_components/content-container';

export const metadata = {
  title: 'SQLテーブルメーカー',
  description: 'テーブル名・カラム・制約を入力してCREATE TABLE文を生成します。',
  openGraph: {
    title: 'SQLテーブルメーカー',
    description:
      'テーブル名・カラム・制約を入力してCREATE TABLE文を生成します。',
    url: 'https://k8o.me/sql-table-builder',
  },
  twitter: {
    title: 'SQLテーブルメーカー',
    card: 'summary',
    description:
      'テーブル名・カラム・制約を入力してCREATE TABLE文を生成します。',
  },
} satisfies Metadata;

export default function Layout({
  children,
}: LayoutProps<'/sql-table-builder'>) {
  return (
    <ContentContainer>
      <div className="flex flex-col gap-4">
        <Heading type="h2">SQLテーブルメーカー</Heading>
        <Suspense fallback={null}>{children}</Suspense>
      </div>
    </ContentContainer>
  );
}
