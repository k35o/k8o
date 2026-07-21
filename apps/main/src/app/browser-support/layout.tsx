import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

import { BrowserSupportHelpDialog } from './_components/browser-support-help-dialog';

const description =
  'Webプラットフォーム機能のブラウザ対応状況を一覧します。すべての対象ブラウザで使える機能（Widely / Newly）に加えて、まだ一部ブラウザのみ対応の新しい機能（先取り）も、ブラウザ別の対応状況つきで確認できます。';

export const metadata = {
  title: 'Browser Support',
  description,
  openGraph: {
    title: 'Browser Support',
    description,
    url: 'https://k8o.me/browser-support',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Browser Support',
    card: 'summary',
    description,
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/browser-support'>) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Heading type="h2">Browser Support</Heading>
          <BrowserSupportHelpDialog />
        </div>
        {children}
      </div>
    </div>
  );
}
