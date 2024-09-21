import { Heading } from '@/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'コントラスト比チェッカー',
  description: 'コントラスト比をチェックします',
  openGraph: {
    title: 'コントラスト比チェッカー',
    description: 'コントラスト比をチェックします',
    url: 'https://k8o.me/colors/contrasts',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'コントラスト比チェッカー',
    card: 'summary',
    description: 'コントラスト比をチェックします',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h3">コントラスト比チェッカー</Heading>
      {children}
    </div>
  );
}
