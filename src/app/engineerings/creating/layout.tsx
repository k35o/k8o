import { Heading } from '@/components/heading';

export const metadata = {
  title: 'テーブル作成',
  description: 'テーブルを作成するSQL文を生成します',
  openGraph: {
    title: 'テーブル作成',
    description: 'テーブルを作成するSQL文を生成します',
    url: 'https://k8o.me/engineerings/creating',
  },
  twitter: {
    title: 'テーブル作成',
    card: 'summary',
    description: 'テーブルを作成するSQL文を生成します',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Heading type="h3">テーブル作成</Heading>
      {children}
    </div>
  );
}
