import { Heading } from '@/components/heading';

export const metadata = {
  title: 'コントラスト比チェッカー',
  description: 'コントラスト比をチェックします',
  openGraph: {
    title: 'コントラスト比チェッカー',
    description: 'コントラスト比をチェックします',
    url: 'https://k8o.me/colors/contrasts',
  },
  twitter: {
    title: 'コントラスト比チェッカー',
    card: 'summary',
    description: 'コントラスト比をチェックします',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h3">コントラスト比チェッカー</Heading>
      {children}
    </div>
  );
}
