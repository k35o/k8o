import Link from 'next/link';
import { Heading } from '../../components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'Colors',
  description: 'コントラスト比など、色にまつわる機能を提供します',
  openGraph: {
    title: 'Colors',
    description: 'コントラスト比など、色にまつわる機能を提供します',
    url: 'https://k8o.me/colors',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Colors',
    card: 'summary',
    description: 'コントラスト比など、色にまつわる機能を提供します',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/colors" className="hover:underline">
        <Heading type="h2">Colors</Heading>
      </Link>
      {children}
    </div>
  );
}
