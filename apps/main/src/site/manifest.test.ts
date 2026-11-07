import { fileURLToPath } from 'node:url';

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { GET } from '../routes/manifest.webmanifest/route';

type Icon = { src: string; sizes: string; type: string };

const iconsOf = async (): Promise<Icon[]> => {
  const { icons }: { icons: Icon[] } = await GET().json();
  return icons;
};

describe('GET /manifest.webmanifest', () => {
  describe('正常系', () => {
    it('192px と 512px のアイコンを挙げる', async () => {
      const icons = await iconsOf();

      expect(icons.map(({ sizes }) => sizes)).toStrictEqual([
        '192x192',
        '512x512',
      ]);
    });

    it('どのアイコンも public の PNG で、寸法が sizes と合う', async () => {
      for (const { src, sizes, type } of await iconsOf()) {
        const { format, width, height } = await sharp(
          fileURLToPath(new URL(`../../public${src}`, import.meta.url)),
        ).metadata();

        expect(type).toBe('image/png');
        expect(format).toBe('png');
        expect(`${String(width)}x${String(height)}`).toBe(sizes);
      }
    });
  });
});
