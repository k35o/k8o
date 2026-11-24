import { safeFetch } from '@repo/helpers/url/safe-fetch';
import { describe, expect, it, vi } from 'vitest';

import { fetchDevsiteBlogItems } from './devsite-blog-source';

vi.mock('@repo/helpers/url/safe-fetch', () => ({
  safeFetch: vi.fn(),
}));

const URL = 'https://developer.chrome.com/_d/dynamic_content?hl=en';

// 一覧の 1 件。実際の応答は 26 要素の配列で、使うのは題・公開日・URL の位置だけ
const entry = (
  title: unknown,
  publishedSeconds: unknown,
  link: unknown,
): unknown[] => [
  title,
  'blog',
  null,
  'https://developer.chrome.com/static/blog/a/image.png',
  '記事の説明',
  [publishedSeconds],
  link,
  'Blog',
];

const devsiteResponse = (body: unknown, status = 200): Response =>
  new Response(`)]}'\n${JSON.stringify(body)}`, { status });

describe('fetchDevsiteBlogItems', () => {
  describe('正常系', () => {
    it('ブログの一覧を、題・リンク・公開日の記事にする', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        devsiteResponse([
          [
            entry(
              'New in DevTools - December 2026',
              1_794_556_800,
              'https://developer.chrome.com/blog/new-in-devtools-december-2026?hl=en',
            ),
            entry(
              'Chrome 159 beta',
              1_794_470_400,
              'https://developer.chrome.com/blog/chrome-159-beta?hl=en',
            ),
          ],
          1,
        ]),
      );

      await expect(fetchDevsiteBlogItems(URL)).resolves.toStrictEqual([
        {
          title: 'New in DevTools - December 2026',
          link: 'https://developer.chrome.com/blog/new-in-devtools-december-2026?hl=en',
          publishedAt: '2026-11-13T08:00:00.000Z',
        },
        {
          title: 'Chrome 159 beta',
          link: 'https://developer.chrome.com/blog/chrome-159-beta?hl=en',
          publishedAt: '2026-11-12T08:00:00.000Z',
        },
      ]);
    });

    it('ブログの記事を新しい順に 20 件求める', async () => {
      vi.mocked(safeFetch).mockResolvedValue(devsiteResponse([[], 1]));

      await fetchDevsiteBlogItems(URL);

      expect(safeFetch).toHaveBeenCalledWith(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json+protobuf' },
        body: '[null,null,null,"type:blog",null,null,null,null,20,null,null,null,2]',
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe('異常系', () => {
    it('一覧を取得できなければ失敗にする', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        new Response('', { status: 500, statusText: 'Internal Server Error' }),
      );

      await expect(fetchDevsiteBlogItems(URL)).rejects.toThrow('500');
    });

    it('応答の形が変わり、題や公開日の位置に別の値が来たら失敗にする', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        devsiteResponse([
          [
            entry(
              null,
              'Chrome 159 beta',
              'https://developer.chrome.com/blog/chrome-159-beta?hl=en',
            ),
          ],
          1,
        ]),
      );

      await expect(fetchDevsiteBlogItems(URL)).rejects.toThrow(
        'ブログの一覧の応答の形が変わった',
      );
    });

    it('JSON の前に XSSI 対策の行が無い応答は失敗にする', async () => {
      vi.mocked(safeFetch).mockResolvedValue(Response.json([[], 1]));

      await expect(fetchDevsiteBlogItems(URL)).rejects.toThrow(
        'ブログの一覧の応答の形が変わった',
      );
    });
  });
});
