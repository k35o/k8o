import { Heading } from '@/components/heading';

export const metadata = {
  title: '基数変換ツール',
  description: '10進数から2進数のように基数を変換します',
  openGraph: {
    title: '基数変換ツール',
    description: '10進数から2進数のように基数を変換します',
    url: 'https://k8o.me/number/converter',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: '基数変換ツール',
    card: 'summary',
    description: '10進数から2進数のように基数を変換します',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h3">基数変換ツール</Heading>
      {children}
    </div>
  );
}
