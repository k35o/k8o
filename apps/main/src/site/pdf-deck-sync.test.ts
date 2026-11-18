import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { syncPdfDecks } from './pdf-deck-sync.ts';
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
