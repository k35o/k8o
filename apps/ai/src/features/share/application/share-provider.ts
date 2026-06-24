import 'server-only';
import {
  isSandboxMode,
  serveSandboxPreview,
  stopSandboxPreview,
} from '@/features/preview/infrastructure/sandbox-preview';

import {
  buildSharedBundle,
  removeSharedBundle,
} from '../infrastructure/local-build';

// 公開バンドルのビルド/配信基盤の抽象。
export type ShareProvider = {
  // 公開時の事前準備（ローカルは静的ビルド、Sandbox は不要＝no-op）。
  build: (slug: string, code: string) => Promise<void>;
  // 非公開化時の後始末（ローカルはバンドル削除、Sandbox は停止）。
  remove: (slug: string) => Promise<void>;
  // 閲覧時に iframe へ出す配信 URL を解決する。
  serve: (slug: string, code: string) => Promise<string>;
};

const sandboxName = (slug: string): string => `share-${slug}`;

const localShareProvider: ShareProvider = {
  build: buildSharedBundle,
  remove: removeSharedBundle,
  // index.html を明示（末尾スラッシュのリダイレクトで相対アセット解決が壊れるのを避ける）。
  serve: (slug) => Promise.resolve(`/s-assets/${slug}/index.html`),
};

// Sandbox モード: 公開コードは DB にあり閲覧時に Sandbox がビルド配信するため事前ビルド不要。
const sandboxShareProvider: ShareProvider = {
  build: () => Promise.resolve(),
  remove: (slug) => stopSandboxPreview(sandboxName(slug)),
  serve: (slug, code) => serveSandboxPreview(sandboxName(slug), code),
};

export const shareProvider: ShareProvider = isSandboxMode()
  ? sandboxShareProvider
  : localShareProvider;
