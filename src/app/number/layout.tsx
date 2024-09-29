import Link from 'next/link';
import { Heading } from '../../components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'Number',
  description: '数値の基数の変換など、便利な変換処理を提供します',
  openGraph: {
    title: 'Number',
    description: '数値の基数の変換など、便利な変換処理を提供します',
    url: 'https://k8o.me/number',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Number',
    card: 'summary',
    description: '数値の基数の変換など、便利な変換処理を提供します',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/number" className="hover:underline">
        <Heading type="h2">Number</Heading>
      </Link>
      {children}
    </div>
  );
}
