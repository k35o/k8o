import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import { BrowserSupportHelpDialog } from './_components/browser-support-help-dialog';

const description =
  'Webプラットフォーム機能のブラウザ対応状況を一覧します。すべての対象ブラウザで使える機能（Widely / Newly）に加えて、まだ一部ブラウザのみ対応の新しい機能（先取り）も、ブラウザ別の対応状況つきで確認できます。';

export const metadata = buildPageMetadata({
  title: 'Browser Support',
  description,
  path: '/browser-support',
});

export default function Layout({ children }: LayoutProps<'/browser-support'>) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Heading level="h2">Browser Support</Heading>
          <BrowserSupportHelpDialog />
        </div>
        {children}
      </div>
    </div>
  );
}
