import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';
import { ContentContainer } from '@/app/_components/content-container';

export const metadata = {
  title: 'QRキット',
  description: 'テキストやURLからQRコードを生成してダウンロードできます。',
  openGraph: {
    title: 'QRキット',
    description: 'テキストやURLからQRコードを生成してダウンロードできます。',
    url: 'https://k8o.me/qr-generator',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'QRキット',
    card: 'summary',
    description: 'テキストやURLからQRコードを生成してダウンロードできます。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/qr-generator'>) {
  return (
    <ContentContainer>
      <div className="flex h-full flex-col gap-4">
        <Heading type="h2">QRキット</Heading>
        {children}
      </div>
    </ContentContainer>
  );
}
