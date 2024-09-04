import { Metadata } from 'next';
import { BlogLayout } from '../_components/blog-layout/blog-layout';

export const metadata: Metadata = {
  title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
  description:
    '背景色とテキスト色のコントラスト比はWCAG 2.1においてAA基準とAAA基準の2つの達成基準によって定められています。 AA基準における大文字のテキストの最小コントラスト比は4.5:1、小文字のテ',
  category: 'color contrast',
  openGraph: {
    title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
    description:
      '背景色とテキスト色のコントラスト比はWCAG 2.1においてAA基準とAAA基準の2つの達成基準によって定められています。 AA基準における大文字のテキストの最小コントラスト比は4.5:1、小文字のテ',
    url: 'https://k8o.me/blog/color-contrast',
    publishedTime: '2024/02/12T00:00:00.000Z',
    authors: ['k8o'],
    siteName: 'k8o',
    locale: 'ja',
    type: 'article',
  },
  twitter: {
    title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
    card: 'summary_large_image',
    description:
      '背景色とテキスト色のコントラスト比はWCAG 2.1においてAA基準とAAA基準の2つの達成基準によって定められています。 AA基準における大文字のテキストの最小コントラスト比は4.5:1、小文字のテ',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BlogLayout updatedAt="2024/02/12">{children}</BlogLayout>;
}
