import { describe, expect, it } from 'vitest';

import { GET } from '@/routes/og.png/route';

import { ogImageVersion, SITE_OG_IMAGE_VERSION } from './site-og-image';

describe('ogImageVersion', () => {
  describe('正常系', () => {
    it('PNG のバイトの sha256 の頭 16 字を版にする', () => {
      expect(ogImageVersion(new Uint8Array([1, 2, 3]))).toBe(
        '039058c6f2c0cb49',
      );
    });
  });
});

describe('サイトの OG の画像', () => {
  describe('正常系', () => {
    it('/og.png は、URL の版を取ったのと同じ PNG を返す', async () => {
      const response = GET();
      const png = new Uint8Array(await response.arrayBuffer());

      expect(response.headers.get('Content-Type')).toBe('image/png');
      expect(ogImageVersion(png)).toBe(SITE_OG_IMAGE_VERSION);
    });
  });
});
