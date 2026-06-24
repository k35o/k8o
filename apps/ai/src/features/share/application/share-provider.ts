import 'server-only';
import {
  serveSandboxPreview,
  stopSandboxPreview,
} from '@/features/preview/infrastructure/sandbox-preview';

// 公開バンドルのビルド/配信基盤の抽象。
export type ShareProvider = {
  // 公開時の事前準備（Sandbox は不要＝no-op。コードは DB にあり閲覧時に配信する）。
  build: (slug: string, code: string) => Promise<void>;
  // 非公開化時の後始末（Sandbox を停止する）。
  remove: (slug: string) => Promise<void>;
  // 閲覧時に iframe へ出す配信 URL を解決する（Sandbox を起こして配信）。
  serve: (slug: string, code: string) => Promise<string>;
};

const sandboxName = (slug: string): string => `share-${slug}`;

// 共有も常に Vercel Sandbox。公開コードは DB にあり、閲覧時に Sandbox がビルド配信する。
export const shareProvider: ShareProvider = {
  build: () => Promise.resolve(),
  remove: (slug) => stopSandboxPreview(sandboxName(slug)),
  serve: (slug, code) => serveSandboxPreview(sandboxName(slug), code),
};
