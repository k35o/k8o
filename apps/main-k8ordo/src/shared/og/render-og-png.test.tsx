import type { SatoriOptions } from 'satori';
import { describe, expect, it } from 'vitest';

import { getMPlus2Font } from './get-m-plus-2-font';
import { renderOgPng } from './render-og-png';

const PNG_SIGNATURE = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const fonts: SatoriOptions['fonts'] = [
  { name: 'M PLUS 2', data: getMPlus2Font(), style: 'normal', weight: 400 },
];

describe('renderOgPng', () => {
  describe('正常系', () => {
    it('1200×630 の PNG を、型を書いた応答で返す', async () => {
      const response = await renderOgPng(
        <div style={{ display: 'flex', fontFamily: '"M PLUS 2"' }}>
          記事のタイトル
        </div>,
        fonts,
      );
      const png = new Uint8Array(await response.arrayBuffer());
      const view = new DataView(png.buffer);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/png');
      expect(png.slice(0, 8)).toStrictEqual(PNG_SIGNATURE);
      expect([view.getUint32(16), view.getUint32(20)]).toStrictEqual([
        1200, 630,
      ]);
    });
  });

  describe('異常系', () => {
    it('フォントに無い字があれば、豆腐で描かずに失敗する', async () => {
      await expect(
        renderOgPng(
          <div style={{ display: 'flex', fontFamily: '"M PLUS 2"' }}>
            前 → 後
          </div>,
          fonts,
        ),
      ).rejects.toThrow('OG のフォントに字形が無い');
    });
  });
});
