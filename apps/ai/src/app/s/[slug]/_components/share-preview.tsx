import { resolveShareEntryForRoute } from '@/features/share/interface/queries';

import { SharePreviewFrame } from './share-preview-frame';

type SharePreviewProps = {
  slug: string;
  title: string;
};

// 公開ページのプレビュー。配信URLの解決（Sandbox 起動を伴うことがある）は
// 呼び出し側の Suspense 境界で待たせ、解決できてから iframe を出す。
export const SharePreview = async ({ slug, title }: SharePreviewProps) => {
  // 解決が reject してもページ全体を error boundary に落とさず、
  // ヘッダを残したまま理由を伝える。
  const entry = await resolveShareEntryForRoute(slug).catch(() => null);

  if (entry === null) {
    return (
      <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm">
        プレビューを表示できませんでした。
      </div>
    );
  }

  return <SharePreviewFrame title={title} url={entry.url} />;
};
