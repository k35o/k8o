import { Metadata } from 'next';
import { BlogLayout } from '../_components/blog-layout/blog-layout';

export const metadata: Metadata = {
  title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
  description:
    '背景色とテキスト色のコントラスト比はWCAG 2.1においてAA基準とAAA基準の2つの達成基準によって定められています。 AA基準における大文字のテキストの最小コントラスト比は4.5:1、小文字のテ',
  category: 'TanStackRouter',
  openGraph: {
    title:
      'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    description:
      '背景色とテキスト色のコントラスト比はWCAG 2.1においてAA基準とAAA基準の2つの達成基準によって定められています。 AA基準における大文字のテキストの最小コントラスト比は4.5:1、小文字のテ',
    url: 'https://k8o.me/blog/tanstack-router-introduction',
  },
  twitter: {
    title:
      'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    card: 'summary',
    description:
      '背景色とテキスト色のコントラスト比はWCAG 2.1においてAA基準とAAA基準の2つの達成基準によって定められています。 AA基準における大文字のテキストの最小コントラスト比は4.5:1、小文字のテ',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BlogLayout updatedAt="2023/07/13">{children}</BlogLayout>;
}
