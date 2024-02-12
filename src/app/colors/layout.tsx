import Link from 'next/link';
import { Heading } from '../_components/heading';

export const metadata = {
  title: 'Colors',
  description: 'コントラスト比など、色にまつわる機能を提供します。',
  openGraph: {
    title: 'Colors',
    description: 'コントラスト比など、色にまつわる機能を提供します。',
    url: 'https://k8o.vercel.app/colors',
  },
  twitter: {
    title: 'Colors',
    card: 'summary',
    description: 'コントラスト比など、色にまつわる機能を提供します。',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/colors">
        <Heading type="h2">Colors</Heading>
      </Link>
      {children}
    </div>
  );
}
