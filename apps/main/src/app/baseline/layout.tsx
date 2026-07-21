import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

import { BaselineHelpDialog } from './_components/baseline-help-dialog';

const description =
  'Webプラットフォーム機能のブラウザ対応状況を一覧します。Baseline（Widely / Newly）に加え、まだ一部ブラウザのみ対応の新しい機能（先取り）も、ブラウザ別の対応状況つきで確認できます。';

export const metadata = {
  title: 'Browser Support',
  description,
  openGraph: {
    title: 'Browser Support',
    description,
    url: 'https://k8o.me/baseline',
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

export default function Layout({ children }: LayoutProps<'/baseline'>) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Heading type="h2">Browser Support</Heading>
          <BaselineHelpDialog />
        </div>
        {children}
      </div>
    </div>
  );
}
