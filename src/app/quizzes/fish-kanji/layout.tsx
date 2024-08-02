import { Heading } from '@/components/heading';

export const metadata = {
  title: '魚編クイズ',
  description: '魚編を持つ漢字の問題を出します',
  openGraph: {
    title: '魚編クイズ',
    description: '魚編を持つ漢字の問題を出します',
    url: 'https://k8o.me/colors',
  },
  twitter: {
    title: '魚編クイズ',
    card: 'summary',
    description: '魚編を持つ漢字の問題を出します',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h3">魚編クイズ</Heading>
      {children}
    </div>
  );
}
