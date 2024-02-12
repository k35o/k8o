import { Heading } from '@/app/_components/heading';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
  category: 'TanStackRouter',
  openGraph: {
    title:
      'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    description:
      'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    url: 'https://k8o.vercel.app/blog/tanstack-router-introduction',
  },
  twitter: {
    title:
      'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    card: 'summary',
    description:
      'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Heading type="h2">
        Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ
      </Heading>
      <article className="rounded-lg bg-white px-1 py-14 pt-4 sm:px-10">
        {children}
      </article>
    </div>
  );
}
