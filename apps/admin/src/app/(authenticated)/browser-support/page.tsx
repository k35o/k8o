import { Suspense } from 'react';

import { ContentFallback, PageHeader } from '@/app/(authenticated)/_components';

import { BrowserSupportContent } from './_components/browser-support-content/browser-support-content';
import { SyncBrowserSupportButton } from './_components/sync-browser-support-button';

export default function BrowserSupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        action={<SyncBrowserSupportButton />}
        description="ブラウザ対応状況スナップショットの管理"
        title="Browser Support"
      />
      <Suspense fallback={<ContentFallback />}>
        <BrowserSupportContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
