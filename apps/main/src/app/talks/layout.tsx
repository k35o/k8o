import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

export const metadata = {
  title: 'Talks',
  description: '過去の登壇テーマや資料へのリンクをまとめています。',
  openGraph: {
    title: 'Talks',
    description: '過去の登壇テーマや資料へのリンクをまとめています。',
    url: 'https://k8o.me/talks',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Talks',
    card: 'summary',
    description: '過去の登壇テーマや資料へのリンクをまとめています。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/talks'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-6">
        <Heading type="h2">Talks</Heading>
        {children}
      </div>
    </div>
  );
}
