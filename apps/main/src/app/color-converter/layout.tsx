import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

export const metadata = {
  title: 'カラーコード職人',
  description:
    'HEX・RGB・HSL・HWB・OKLCH・OKLAB・LCH・LABを相互に変換します。どの形式でも貼り付けでき、スライダーで微調整できます。',
  openGraph: {
    title: 'カラーコード職人',
    description:
      'HEX・RGB・HSL・HWB・OKLCH・OKLAB・LCH・LABを相互に変換します。どの形式でも貼り付けでき、スライダーで微調整できます。',
    url: 'https://k8o.me/color-converter',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'カラーコード職人',
    card: 'summary',
    description:
      'HEX・RGB・HSL・HWB・OKLCH・OKLAB・LCH・LABを相互に変換します。どの形式でも貼り付けでき、スライダーで微調整できます。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/color-converter'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex h-full flex-col gap-4">
        <Heading type="h2">カラーコード職人</Heading>
        {children}
      </div>
    </div>
  );
}
