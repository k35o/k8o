import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';
import { ContentContainer } from '@/app/_components/content-container';

export const metadata = {
  title: '基数チェンジャー',
  description: '2進数・8進数・10進数・16進数を相互に変換します。',
  openGraph: {
    title: '基数チェンジャー',
    description: '2進数・8進数・10進数・16進数を相互に変換します。',
    url: 'https://k8o.me/base-converter',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: '基数チェンジャー',
    card: 'summary',
    description: '2進数・8進数・10進数・16進数を相互に変換します。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/base-converter'>) {
  return (
    <ContentContainer>
      <div className="flex h-full flex-col gap-4">
        <Heading type="h2">基数チェンジャー</Heading>
        {children}
      </div>
    </ContentContainer>
  );
}
