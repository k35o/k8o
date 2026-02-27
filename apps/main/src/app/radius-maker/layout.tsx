import { Heading } from '@k8o/arte-odyssey/heading';
import type { Metadata } from 'next';

export const metadata = {
  title: 'かどまるラボ',
  description: 'border-radiusを視覚的に操作してCSSを生成します。',
  openGraph: {
    title: 'かどまるラボ',
    description: 'border-radiusを視覚的に操作してCSSを生成します。',
    url: 'https://k8o.me/rounded-maker',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'かどまるラボ',
    card: 'summary',
    description: 'border-radiusを視覚的に操作してCSSを生成します。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/radius-maker'>) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">かどまるラボ</Heading>
      {children}
    </div>
  );
}
