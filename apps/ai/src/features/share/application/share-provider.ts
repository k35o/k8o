import 'server-only';
import {
  buildSharedBundle,
  removeSharedBundle,
} from '../infrastructure/local-build';

// 公開バンドルのビルド/配信基盤の抽象。
export type ShareProvider = {
  build: (slug: string, code: string) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  // index.html を明示する。末尾スラッシュのリダイレクトで相対アセット解決が壊れるのを避ける。
  entryUrl: (slug: string) => string;
};

const localShareProvider: ShareProvider = {
  build: buildSharedBundle,
  remove: removeSharedBundle,
  entryUrl: (slug) => `/s-assets/${slug}/index.html`,
};

// TODO(本番): Vercel Sandbox でビルド→Blob/静的ホストに置く provider へ差し替える。
export const shareProvider: ShareProvider = localShareProvider;
