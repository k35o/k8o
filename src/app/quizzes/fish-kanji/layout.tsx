import { Heading } from '@/components/heading';

export const metadata = {
  title: 'うおへんクイズ',
  description: 'うおへんを持つ漢字の問題を出します',
  openGraph: {
    title: 'うおへんクイズ',
    description: 'うおへんを持つ漢字の問題を出します',
    url: 'https://k8o.me/colors',
  },
  twitter: {
    title: 'うおへんクイズ',
    card: 'summary',
    description: 'うおへんを持つ漢字の問題を出します',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h3">うおへんクイズ</Heading>
      {children}
    </div>
  );
}
