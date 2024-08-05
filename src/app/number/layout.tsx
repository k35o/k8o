import Link from 'next/link';
import { Heading } from '../../components/heading';

export const metadata = {
  title: 'Converter',
  description:
    '数値の基数の変換やカラーコードの変換など、便利な変換処理を提供します。',
  openGraph: {
    title: 'Converter',
    description:
      '数値の基数の変換やカラーコードの変換など、便利な変換処理を提供します。',
    url: 'https://k8o.me/converter',
  },
  twitter: {
    title: 'Converter',
    card: 'summary',
    description:
      '数値の基数の変換やカラーコードの変換など、便利な変換処理を提供します。',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/number">
        <Heading type="h2">Number</Heading>
      </Link>
      {children}
    </div>
  );
}
