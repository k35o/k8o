import { Heading } from '@k8o/arte-odyssey/heading';

export const metadata = {
  title: 'コントラストチェッカー',
  description: '2色のコントラスト比を計算し、WCAGの基準で評価します。',
  openGraph: {
    title: 'コントラストチェッカー',
    description: '2色のコントラスト比を計算し、WCAGの基準で評価します。',
    url: 'https://k8o.me/contrast-checker',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'コントラストチェッカー',
    card: 'summary',
    description: '2色のコントラスト比を計算し、WCAGの基準で評価します。',
  },
};

export default function Layout({ children }: LayoutProps<'/contrast-checker'>) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">コントラストチェッカー</Heading>
      {children}
    </div>
  );
}
