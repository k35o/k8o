import Link from 'next/link';
import { Heading } from '../../components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'Engineerings',
  description:
    'Webアプリケーション開発に役立つあれこれを用意しています',
  openGraph: {
    title: 'Engineerings',
    description:
      'Webアプリケーション開発に役立つあれこれを用意しています',
    url: 'https://k8o.me/engineerings',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Engineerings',
    card: 'summary',
    description:
      'Webアプリケーション開発に役立つあれこれを用意しています',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/engineerings" className="hover:underline">
        <Heading type="h2">Engineerings</Heading>
      </Link>
      {children}
    </div>
  );
}
