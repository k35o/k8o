import { Heading } from '@k8o/arte-odyssey/heading';

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
};

export default function Layout({ children }: LayoutProps<'/qr-generator'>) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">QRキット</Heading>
      {children}
    </div>
  );
}
