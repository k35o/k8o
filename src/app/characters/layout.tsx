import Link from 'next/link';
import { Heading } from '../../components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'Characters',
  description: '入力した文字の検索など、文字に対する操作を提供します',
  openGraph: {
    title: 'Characters',
    description:
      '入力した文字の検索など、文字に対する操作を提供します',
    url: 'https://k8o.me/characters',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Characters',
    card: 'summary',
    description:
      '入力した文字の検索など、文字に対する操作を提供します',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/characters">
        <Heading type="h2">Characters</Heading>
      </Link>
      {children}
    </div>
  );
}
