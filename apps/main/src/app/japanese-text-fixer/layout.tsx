import { Heading } from '@k8o/arte-odyssey/heading';
import type { Metadata } from 'next';
import { ProofreadProvider } from './_state/provider';

export const metadata = {
  title: '日本語校正くん',
  description: '日本語の文章を解析し、誤字脱字や文法ミスを指摘します。',
  openGraph: {
    title: '日本語校正くん',
    description: '日本語の文章を解析し、誤字脱字や文法ミスを指摘します。',
    url: 'https://k8o.me/japanese-text-fixer',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: '日本語校正くん',
    card: 'summary',
    description: '日本語の文章を解析し、誤字脱字や文法ミスを指摘します。',
  },
} satisfies Metadata;

export default function Layout({
  children,
}: LayoutProps<'/japanese-text-fixer'>) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">日本語校正くん</Heading>
      <ProofreadProvider>{children}</ProofreadProvider>
    </div>
  );
}
