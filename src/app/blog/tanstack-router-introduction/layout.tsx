import { Metadata } from 'next';
import { BlogLayout } from '../_components/blog-layout/blog-layout';

export const metadata: Metadata = {
  title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
  description:
    'React で開発する時、どのようにルーティングを実装していますか？Next.jsやRemixなどのフレームワークを用いて開発するときはフレームワークに実装されたルーティング利用し、フレームワークを利',
  category: 'TanStackRouter',
  openGraph: {
    title:
      'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    description:
      'React で開発する時、どのようにルーティングを実装していますか？Next.jsやRemixなどのフレームワークを用いて開発するときはフレームワークに実装されたルーティング利用し、フレームワークを利',
    url: 'https://k8o.me/blog/tanstack-router-introduction',
    publishedTime: '2023/07/13T00:00:00.000Z',
    authors: ['k8o'],
    siteName: 'k8o',
    locale: 'ja',
    type: 'article',
  },
  twitter: {
    title:
      'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    card: 'summary_large_image',
    description:
      'React で開発する時、どのようにルーティングを実装していますか？Next.jsやRemixなどのフレームワークを用いて開発するときはフレームワークに実装されたルーティング利用し、フレームワークを利',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BlogLayout
      updatedAt="2023/07/13"
      slug="tanstack-router-introduction"
    >
      {children}
    </BlogLayout>
  );
}
