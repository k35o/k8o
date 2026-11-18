import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  fillMissingPdfDecks,
  publicSiteStore,
  syncPdfDecks,
} from './pdf-deck-sync.ts';
import type { PdfDeckStore } from './pdf-deck-sync.ts';

// pathname → 中身 の表を持つ、メモリの中のストア。取りに行った pathname を覚える
const fakeStore = (
  blobs: Record<string, string>,
): PdfDeckStore & { downloaded: string[] } => {
  const downloaded: string[] = [];
  return {
    downloaded,
    list: (prefix) =>
      Promise.resolve(
        Object.entries(blobs)
          .filter(([pathname]) => pathname.startsWith(prefix))
          .map(([pathname, body]) => ({
            pathname,
            size: Buffer.byteLength(body),
          })),
      ),
    download: async (pathname, to) => {
      downloaded.push(pathname);
      await writeFile(to, blobs[pathname] ?? '');
    },
  };
};

const tempSlidesDir = () => mkdtemp(join(tmpdir(), 'pdf-deck-sync-'));

describe('syncPdfDecks', () => {
  describe('正常系', () => {
    it('挙げたデッキのファイルを、ストアの prefix を除いたパスに写す', async () => {
      const decksDir = await tempSlidesDir();
      const store = fakeStore({
        'talks/my-talk/deck.json': '{}',
        'talks/my-talk/pages/001.960w.avif': 'avif',
        'talks/other/deck.json': '{"other":true}',
      });

      await syncPdfDecks({ slugs: ['my-talk'], decksDir, store });

      await expect(
        readFile(join(decksDir, 'my-talk/pages/001.960w.avif'), 'utf8'),
      ).resolves.toBe('avif');
      expect(existsSync(join(decksDir, 'other'))).toBe(false);
    });

    it('挙げていないデッキのディレクトリは消し、直下のファイルは残す', async () => {
      const decksDir = await tempSlidesDir();
      await mkdir(join(decksDir, 'unpublished'));
      await writeFile(join(decksDir, 'unpublished/deck.json'), '{}');
      await writeFile(join(decksDir, 'sample-deck-k8o.avif'), 'avif');

      await syncPdfDecks({ slugs: [], decksDir, store: fakeStore({}) });

      expect(existsSync(join(decksDir, 'unpublished'))).toBe(false);
      expect(existsSync(join(decksDir, 'sample-deck-k8o.avif'))).toBe(true);
    });
  });

  describe('異常系', () => {
    it('ストアに中身の無いデッキは投げる', async () => {
      const decksDir = await tempSlidesDir();

      await expect(
        syncPdfDecks({ slugs: ['missing'], decksDir, store: fakeStore({}) }),
      ).rejects.toThrow(
        'トーク "missing" のデッキは MDX が無く、ストアの talks/missing/ にも中身が無い',
      );
    });
  });

  describe('エッジケース', () => {
    it('大きさが同じファイルは取り直さず、違うファイルだけ取り直す', async () => {
      const decksDir = await tempSlidesDir();
      const store = fakeStore({
        'talks/my-talk/deck.json': '{"title":"新しい題"}',
        'talks/my-talk/pages/001.960w.avif': 'avif',
      });
      await mkdir(join(decksDir, 'my-talk/pages'), { recursive: true });
      await writeFile(join(decksDir, 'my-talk/deck.json'), '{}');
      await writeFile(join(decksDir, 'my-talk/pages/001.960w.avif'), 'avif');

      await syncPdfDecks({ slugs: ['my-talk'], decksDir, store });

      expect(store.downloaded).toStrictEqual(['talks/my-talk/deck.json']);
    });

    it('元の PDF は写さない', async () => {
      const decksDir = await tempSlidesDir();
      const store = fakeStore({
        'talks/my-talk/deck.json': '{}',
        'talks/my-talk/deck.pdf': 'pdf',
      });

      await syncPdfDecks({ slugs: ['my-talk'], decksDir, store });

      expect(store.downloaded).toStrictEqual(['talks/my-talk/deck.json']);
      expect(existsSync(join(decksDir, 'my-talk/deck.pdf'))).toBe(false);
    });
  });
});

describe('fillMissingPdfDecks', () => {
  describe('正常系', () => {
    it('手元に無いデッキを、ストアから写す', async () => {
      const decksDir = await tempSlidesDir();
      const store = fakeStore({
        'talks/my-talk/deck.json': '{"pages":[]}',
        'talks/my-talk/pages/001.960w.avif': 'avif',
      });

      await fillMissingPdfDecks({ slugs: ['my-talk'], decksDir, store });

      await expect(
        readFile(join(decksDir, 'my-talk/deck.json'), 'utf8'),
      ).resolves.toBe('{"pages":[]}');
      await expect(
        readFile(join(decksDir, 'my-talk/pages/001.960w.avif'), 'utf8'),
      ).resolves.toBe('avif');
    });
  });

  describe('エッジケース', () => {
    it('手元にマニフェストのあるデッキは、ストアに取りに行かない', async () => {
      const decksDir = await tempSlidesDir();
      const store = fakeStore({ 'talks/my-talk/deck.json': '{"pages":[]}' });
      await mkdir(join(decksDir, 'my-talk'));
      await writeFile(join(decksDir, 'my-talk/deck.json'), '{"local":true}');

      await fillMissingPdfDecks({ slugs: ['my-talk'], decksDir, store });

      expect(store.downloaded).toStrictEqual([]);
      await expect(
        readFile(join(decksDir, 'my-talk/deck.json'), 'utf8'),
      ).resolves.toBe('{"local":true}');
    });

    it('ストアに無いデッキは、投げずに飛ばす', async () => {
      const decksDir = await tempSlidesDir();

      await fillMissingPdfDecks({
        slugs: ['unpublished'],
        decksDir,
        store: fakeStore({}),
      });

      expect(existsSync(join(decksDir, 'unpublished'))).toBe(false);
    });

    it('挙げていないデッキのディレクトリを消さない', async () => {
      const decksDir = await tempSlidesDir();
      await mkdir(join(decksDir, 'draft'));
      await writeFile(join(decksDir, 'draft/deck.json'), '{}');

      await fillMissingPdfDecks({ slugs: [], decksDir, store: fakeStore({}) });

      expect(existsSync(join(decksDir, 'draft/deck.json'))).toBe(true);
    });
  });
});

describe('publicSiteStore', () => {
  // url → 応答 の表を持つ fetch。表に無い url は 404 を返す
  const fakeFetch =
    (responses: Record<string, string>) =>
    (url: string): Promise<Response> => {
      const body = responses[url];
      return Promise.resolve(
        body === undefined
          ? new Response('', { status: 404 })
          : new Response(body),
      );
    };

  describe('正常系', () => {
    it('公開されているマニフェストから、マニフェストと全ページの画像を挙げる', async () => {
      const store = publicSiteStore(
        'https://example.test',
        fakeFetch({
          'https://example.test/talks/my-talk/deck.json':
            '{"pages":[{"width":1920},{"width":1920}]}',
        }),
      );

      await expect(store.list('talks/my-talk/')).resolves.toStrictEqual([
        { pathname: 'talks/my-talk/pages/001.960w.avif' },
        { pathname: 'talks/my-talk/pages/001.1920w.avif' },
        { pathname: 'talks/my-talk/pages/002.960w.avif' },
        { pathname: 'talks/my-talk/pages/002.1920w.avif' },
        { pathname: 'talks/my-talk/deck.json' },
      ]);
    });

    it('挙げたファイルを、サイトの同じパスから写す', async () => {
      const decksDir = await tempSlidesDir();
      const store = publicSiteStore(
        'https://example.test',
        fakeFetch({
          'https://example.test/talks/my-talk/pages/001.960w.avif': 'avif',
        }),
      );

      await store.download(
        'talks/my-talk/pages/001.960w.avif',
        join(decksDir, '001.avif'),
      );

      await expect(readFile(join(decksDir, '001.avif'), 'utf8')).resolves.toBe(
        'avif',
      );
    });
  });

  describe('エッジケース', () => {
    it('公開されていないデッキは、何も挙げない', async () => {
      const store = publicSiteStore('https://example.test', fakeFetch({}));

      await expect(store.list('talks/unpublished/')).resolves.toStrictEqual([]);
    });
  });

  describe('異常系', () => {
    it('サイトに無いファイルを写そうとすると投げる', async () => {
      const decksDir = await tempSlidesDir();
      const store = publicSiteStore('https://example.test', fakeFetch({}));

      await expect(
        store.download('talks/my-talk/deck.json', join(decksDir, 'deck.json')),
      ).rejects.toThrow(
        'https://example.test/talks/my-talk/deck.json を読めない（404）',
      );
    });
  });
});
