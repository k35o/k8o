import 'server-only';
import {
  buildSharedBundle,
  removeSharedBundle,
} from '../infrastructure/local-build';

// 公開バンドルのビルド/配信基盤の抽象。build=公開版を静的バンドル化、remove=削除、
// assetBaseUrl=公開ページの iframe が読むベースURL（末尾スラッシュ）。
export type ShareProvider = {
  build: (slug: string, code: string) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  // 公開ページの iframe が読むエントリURL（index.html を明示。末尾スラッシュの
  // リダイレクトで相対アセット解決が壊れるのを避ける）。
  entryUrl: (slug: string) => string;
};

const localShareProvider: ShareProvider = {
  build: buildSharedBundle,
  remove: removeSharedBundle,
  // ローカルは CORS 付きの配信ルート（同一オリジンだが iframe は不透明オリジンで隔離）。
  entryUrl: (slug) => `/s-assets/${slug}/index.html`,
};

// TODO(本番): Vercel Sandbox でビルド→Blob/静的ホストに置く provider へ差し替える。
export const shareProvider: ShareProvider = localShareProvider;
