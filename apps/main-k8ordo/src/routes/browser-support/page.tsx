import { BrowserSupportIndex } from '@/components/browser-support/browser-support-index/browser-support-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';
import { getFeatureBlogMap } from '@/features/blog/interface/queries';
import { getBrowserSupportSnapshot } from '@/features/browser-support/interface/queries';

export default async function BrowserSupportPage() {
  const [snapshot, blogMap] = await Promise.all([
    getBrowserSupportSnapshot(),
    getFeatureBlogMap(),
  ]);

  return (
    <>
      <PageMeta
        description="Webプラットフォーム機能のブラウザ対応状況を一覧します。すべての対象ブラウザで使える機能（Widely / Newly）に加えて、まだ一部ブラウザのみ対応の新しい機能（先取り）も、ブラウザ別の対応状況つきで確認できます。"
        path="/browser-support"
        title="Browser Support"
      />
      <BrowserSupportIndex blogMap={blogMap} snapshot={snapshot} />
    </>
  );
}
