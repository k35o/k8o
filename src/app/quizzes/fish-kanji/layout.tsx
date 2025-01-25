import { Heading } from '@/components/heading';
import { PropsWithChildren } from 'react';

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
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="font-noto-sans-jp" />
      <Heading type="h3">うおへんクイズ</Heading>
      <section className="bg-bg-base/55 h-full rounded-lg p-10">
        {children}
      </section>
    </div>
  );
}
