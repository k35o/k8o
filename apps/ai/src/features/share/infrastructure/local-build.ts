import 'server-only';
import { buildBundle } from './build-bundle';
import { getBundleSink } from './bundle-sink';

// 公開用の「本物ビルド」。sandbox-template に生成コードを差し込んで vite build し、出力
// バンドルを sink（ローカルは .ai-shared/<slug>/ ディスク、本番は Vercel Blob）に配置する。
// build（成果物化）と sink（配置先）を分離したので、本番でも同じビルド経路を流用できる。

export const buildSharedBundle = async (
  slug: string,
  code: string,
): Promise<void> => {
  const files = await buildBundle(code);
  await getBundleSink().put(slug, files);
};

export const removeSharedBundle = (slug: string): Promise<void> =>
  getBundleSink().remove(slug);

// ビルド済みアセットを読み出す（配信ルートが利用）。slug 検証と path traversal 防止は
// sink 側（bundle-sink）で行う。
export const readSharedAsset = (
  slug: string,
  segments: readonly string[],
): Promise<{ body: Buffer; contentType: string } | null> =>
  getBundleSink().get(slug, segments);
