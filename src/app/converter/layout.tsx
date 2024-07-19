import { Heading } from '../_components/heading';

export const metadata = {
  title: 'Converter',
  description:
    '数値の基数の変換やカラーコードの変換など、便利な変換処理を提供します。',
  openGraph: {
    title: 'Converter',
    description:
      '数値の基数の変換やカラーコードの変換など、便利な変換処理を提供します。',
    url: 'https://k8o.me/converter',
  },
  twitter: {
    title: 'Converter',
    card: 'summary',
    description:
      '数値の基数の変換やカラーコードの変換など、便利な変換処理を提供します。',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Heading type="h2">Converter</Heading>
      {children}
    </div>
  );
}
