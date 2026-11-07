import { createHash } from 'node:crypto';

import { OgImage } from './og-image';

export const ogImageVersion = (png: Uint8Array): string =>
  createHash('sha256').update(png).digest('hex').slice(0, 16);

// og:image の URL に中身の版を入れるには、head を書く前に画像が要る。読み込むときに 1 度だけ描き、/og.png もこのバイトを返す
export const SITE_OG_IMAGE_PNG = new Uint8Array(
  await (await OgImage({ title: 'k8o' })).arrayBuffer(),
);

export const SITE_OG_IMAGE_VERSION = ogImageVersion(SITE_OG_IMAGE_PNG);
