import { Heading } from '@/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'QRKit',
  description:
    '任意のテキストやURLからQRコードを生成できるツールです。',
  openGraph: {
    title: 'QRKit',
    description:
      '任意のテキストやURLからQRコードを生成できるツールです。',
    url: 'https://k8o.me/qr-generator',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'QRKit',
    card: 'summary',
    description:
      '任意のテキストやURLからQRコードを生成できるツールです。',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">QRKit</Heading>
      {children}
    </div>
  );
}
