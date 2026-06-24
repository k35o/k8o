import 'server-only';
import { buildBundle } from './build-bundle';
import { getBundleSink } from './bundle-sink';

export const buildSharedBundle = async (
  slug: string,
  code: string,
): Promise<void> => {
  const files = await buildBundle(code);
  await getBundleSink().put(slug, files);
};

export const removeSharedBundle = (slug: string): Promise<void> =>
  getBundleSink().remove(slug);

// slug 検証と path traversal 防止は sink 側（bundle-sink）で行う。
export const readSharedAsset = (
  slug: string,
  segments: readonly string[],
): Promise<{ body: Buffer; contentType: string } | null> =>
  getBundleSink().get(slug, segments);
