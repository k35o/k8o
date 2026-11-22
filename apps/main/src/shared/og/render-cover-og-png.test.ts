import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { renderCoverOgPng } from './render-cover-og-png';

const BASE = { r: 15, g: 118, b: 110 };
const MARKER = { r: 239, g: 68, b: 68 };

type Color = typeof BASE;

// 地の色の表紙の左上の角に、印の正方形を置いた AVIF
const coverWithMarker = async (
  width: number,
  height: number,
  markerSize: number,
): Promise<Uint8Array> => {
  const marker = await sharp({
    create: {
      width: markerSize,
      height: markerSize,
      channels: 3,
      background: MARKER,
    },
  })
    .png()
    .toBuffer();
  return new Uint8Array(
    await sharp({ create: { width, height, channels: 3, background: BASE } })
      .composite([{ input: marker, left: 0, top: 0 }])
      .avif({ effort: 0 })
      .toBuffer(),
  );
};

const decode = async (
  response: Response,
): Promise<{
  width: number;
  height: number;
  colorAt: (x: number, y: number) => Color;
}> => {
  const { data, info } = await sharp(
    new Uint8Array(await response.arrayBuffer()),
  )
    .raw()
    .toBuffer({ resolveWithObject: true });
  return {
    width: info.width,
    height: info.height,
    colorAt: (x, y): Color => {
      const offset = (y * info.width + x) * info.channels;
      return {
        r: data[offset] ?? -1,
        g: data[offset + 1] ?? -1,
        b: data[offset + 2] ?? -1,
      };
    },
  };
};

// 2 つの色の、成分ごとの差の最大
const colorDistance = (a: Color, b: Color): number =>
  Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b));

// AVIF の圧縮と縮めたときの補間で、色が少しずれる
const TOLERANCE = 4;

describe('renderCoverOgPng', () => {
  describe('正常系', () => {
    it('1200×630 の PNG を、型を書いた応答で返す', async () => {
      const response = await renderCoverOgPng(
        await coverWithMarker(1920, 1080, 96),
      );
      const { width, height } = await decode(response);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/png');
      expect([width, height]).toStrictEqual([1200, 630]);
    });

    it('16:9 の表紙を切らずに収め、左右の余りを表紙の縁の色で埋める', async () => {
      // 1920×1080 は 1120×630 に縮み、左右に 40 ずつ余る。96 の印は 56 になる。上下を切って全面に広げると、
      // 印は 38 の高さで切れる
      const { colorAt } = await decode(
        await renderCoverOgPng(await coverWithMarker(1920, 1080, 96)),
      );

      expect(colorDistance(colorAt(70, 45), MARKER)).toBeLessThanOrEqual(
        TOLERANCE,
      );
      expect(colorDistance(colorAt(100, 70), BASE)).toBeLessThanOrEqual(
        TOLERANCE,
      );
      expect(colorDistance(colorAt(5, 315), BASE)).toBeLessThanOrEqual(
        TOLERANCE,
      );
      expect(colorDistance(colorAt(1195, 315), BASE)).toBeLessThanOrEqual(
        TOLERANCE,
      );
    });

    it('4:3 の表紙も切らずに収め、広い余りを表紙の縁の色で埋める', async () => {
      // 1600×1200 は 840×630 に縮み、左右に 180 ずつ余る。120 の印は 63 になる
      const { colorAt } = await decode(
        await renderCoverOgPng(await coverWithMarker(1600, 1200, 120)),
      );

      expect(colorDistance(colorAt(200, 20), MARKER)).toBeLessThanOrEqual(
        TOLERANCE,
      );
      expect(colorDistance(colorAt(260, 80), BASE)).toBeLessThanOrEqual(
        TOLERANCE,
      );
      expect(colorDistance(colorAt(60, 315), BASE)).toBeLessThanOrEqual(
        TOLERANCE,
      );
      expect(colorDistance(colorAt(1140, 315), BASE)).toBeLessThanOrEqual(
        TOLERANCE,
      );
    });
  });

  describe('エッジケース', () => {
    it('縦横比が OG と同じ表紙は、余りを作らず全面に描く', async () => {
      const { width, height, colorAt } = await decode(
        await renderCoverOgPng(await coverWithMarker(2400, 1260, 96)),
      );

      expect([width, height]).toStrictEqual([1200, 630]);
      expect(colorDistance(colorAt(20, 20), MARKER)).toBeLessThanOrEqual(
        TOLERANCE,
      );
    });
  });

  describe('異常系', () => {
    it('画像として読めないバイトは投げる', async () => {
      await expect(
        renderCoverOgPng(new TextEncoder().encode('not an image')),
      ).rejects.toThrow('unsupported image format');
    });
  });
});
