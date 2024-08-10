import { Heading } from '@/components/heading';
import { FC } from 'react';

export const metadata = {
  title: 'うおへんクイズ',
  description: 'うおへんを持つ漢字の問題を出します',
  openGraph: {
    title: 'うおへんクイズ',
    description: 'うおへんを持つ漢字の問題を出します',
    url: 'https://k8o.me/quizzes/fish-kanji',
  },
  twitter: {
    title: 'うおへんクイズ',
    card: 'summary',
    description: 'うおへんを持つ漢字の問題を出します',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h3">うおへんクイズ</Heading>
      <section className="h-full rounded-lg bg-white p-10">
        {children}
      </section>
      <PreloadFont />
    </div>
  );
}

const PreloadFont: FC = () => <div className="font-notoSansJp" />;
