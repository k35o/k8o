import Link from 'next/link';
import { Heading } from '../../components/heading';

export const metadata = {
  title: 'Engineerings',
  description:
    'Webアプリケーション開発に役立つあれこれを用意しています',
  openGraph: {
    title: 'Engineerings',
    description:
      'Webアプリケーション開発に役立つあれこれを用意しています',
    url: 'https://k8o.me/engineerings',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Engineerings',
    card: 'summary',
    description:
      'Webアプリケーション開発に役立つあれこれを用意しています',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/engineerings">
        <Heading type="h2">Engineerings</Heading>
      </Link>
      {children}
    </div>
  );
}
