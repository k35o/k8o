import { Heading } from '@/components/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'コントラストチェッカー',
  description:
    '2つの色のコントラスト比を計算し、アクセシビリティ基準を満たしているか確認するツールです。',
  openGraph: {
    title: 'コントラストチェッカー',
    description:
      '2つの色のコントラスト比を計算し、アクセシビリティ基準を満たしているか確認するツールです。',
    url: 'https://k8o.me/colors/contrasts',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'コントラストチェッカー',
    card: 'summary',
    description:
      '2つの色のコントラスト比を計算し、アクセシビリティ基準を満たしているか確認するツールです。',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">コントラストチェッカー</Heading>
      {children}
    </div>
  );
}
