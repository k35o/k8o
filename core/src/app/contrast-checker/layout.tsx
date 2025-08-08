import { Heading } from '@k8o/arte-odyssey/heading';
import type { PropsWithChildren } from 'react';

export const metadata = {
  title: 'コントラストチェッカー',
  description:
    '選択した2つの色からコントラスト比を計算します。WCAGが定める基準から色の組み合わせの妥当性を確認できます。',
  openGraph: {
    title: 'コントラストチェッカー',
    description:
      '選択した2つの色からコントラスト比を計算します。WCAGが定める基準から色の組み合わせの妥当性を確認できます。',
    url: 'https://k8o.me/contrast-checker',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'コントラストチェッカー',
    card: 'summary',
    description:
      '選択した2つの色からコントラスト比を計算します。WCAGが定める基準から色の組み合わせの妥当性を確認できます。',
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
