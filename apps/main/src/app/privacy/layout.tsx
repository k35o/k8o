import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

const DESCRIPTION =
  'k8o.meにおけるアクセス解析やお問い合わせ情報の取り扱いについて説明します。';

export const metadata = {
  title: 'Privacy',
  description: DESCRIPTION,
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy',
    description: DESCRIPTION,
    url: 'https://k8o.me/privacy',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Privacy',
    card: 'summary',
    description: DESCRIPTION,
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/privacy'>) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-col gap-8">
        <Heading level="h2">プライバシーポリシー</Heading>
        {children}
      </div>
    </div>
  );
}
