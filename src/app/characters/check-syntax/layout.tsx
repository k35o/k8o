import { Heading } from '@/components/heading';
import { CheckSyntaxProvider } from './_state/text';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: '日本語校正くん',
  description: 'テキストエリアに入力した文章の校正を行います',
  openGraph: {
    title: '日本語校正くん',
    description: 'テキストエリアに入力した文章の校正を行います',
    url: 'https://k8o.me/characters/check-syntax',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: '日本語校正くん',
    card: 'summary',
    description: 'テキストエリアに入力した文章の校正を行います',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h3">日本語校正くん</Heading>
      <CheckSyntaxProvider>{children}</CheckSyntaxProvider>
    </div>
  );
}
