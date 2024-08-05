import { Metadata } from 'next';
import { BlogLayout } from '../_components/blog-layout/blog-layout';

export const metadata: Metadata = {
  title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
  description:
    'React で開発する時、どのようにルーティングを実装していますか？Next.jsやRemixなどのフレームワークを用いて開発するときはフレームワークに実装されたルーティング利用し、フレームワークを利',
  category: 'color contrast',
  openGraph: {
    title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
    description:
      'React で開発する時、どのようにルーティングを実装していますか？Next.jsやRemixなどのフレームワークを用いて開発するときはフレームワークに実装されたルーティング利用し、フレームワークを利',
    url: 'https://k8o.me/blog/color-contrast',
  },
  twitter: {
    title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
    card: 'summary',
    description:
      'React で開発する時、どのようにルーティングを実装していますか？Next.jsやRemixなどのフレームワークを用いて開発するときはフレームワークに実装されたルーティング利用し、フレームワークを利',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BlogLayout updatedAt="2024/02/12">{children}</BlogLayout>;
}
