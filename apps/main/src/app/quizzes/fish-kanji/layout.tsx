import type { Metadata } from 'next';

export const metadata = {
  title: 'うおへんクイズ',
  description: 'うおへんを持つ漢字の問題を出します',
  openGraph: {
    title: 'うおへんクイズ',
    description: 'うおへんを持つ漢字の問題を出します',
    url: 'https://k8o.me/quizzes/fish-kanji',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'うおへんクイズ',
    card: 'summary',
    description: 'うおへんを持つ漢字の問題を出します',
  },
} satisfies Metadata;

export default function Layout({
  children,
}: LayoutProps<'/quizzes/fish-kanji/list'>) {
  return children;
}
