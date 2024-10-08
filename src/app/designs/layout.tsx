import Link from 'next/link';
import { Heading } from '@/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'Designs',
  description: '自分だけのデザインを探すための場所です',
  openGraph: {
    title: 'Designs',
    description: '自分だけのデザインを探すための場所です',
    url: 'https://k8o.me/designs',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Designs',
    card: 'summary',
    description: '自分だけのデザインを探すための場所です',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/number" className="hover:underline">
        <Heading type="h2">Designs</Heading>
      </Link>
      {children}
    </div>
  );
}
