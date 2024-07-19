import { Heading } from '../_components/heading';

export const metadata = {
  title: 'SQL Statement',
  description:
    'テーブルの作成など、SQLに関するコマンドを作成する機能を提供します。',
  openGraph: {
    title: 'SQL Statement',
    description:
      'テーブルの作成など、SQLに関するコマンドを作成する機能を提供します。',
    url: 'https://k8o.me/sql-statement',
  },
  twitter: {
    title: 'SQL Statement',
    card: 'summary',
    description:
      'テーブルの作成など、SQLに関するコマンドを作成する機能を提供します。',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Heading type="h2">SQL Statement</Heading>
      {children}
    </div>
  );
}
