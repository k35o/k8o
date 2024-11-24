import { Heading } from '@/components/heading';
import { CheckSyntaxProvider } from './_state/text';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: '日本語校正くん',
  description:
    '日本語文章の誤字脱字、文法ミス、表現の改善ポイントを簡単にチェックできるツールです。',
  openGraph: {
    title: '日本語校正くん',
    description:
      '日本語文章の誤字脱字、文法ミス、表現の改善ポイントを簡単にチェックできるツールです。',
    url: 'https://k8o.me/japanese-text-fixer',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: '日本語校正くん',
    card: 'summary',
    description:
      '日本語文章の誤字脱字、文法ミス、表現の改善ポイントを簡単にチェックできるツールです。',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">日本語校正くん</Heading>
      <CheckSyntaxProvider>{children}</CheckSyntaxProvider>
    </div>
  );
}
