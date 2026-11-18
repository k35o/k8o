import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { getTalks as readTalks } from '@repo/api/build-data';
import type { Talk } from '@repo/api/build-data';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deckMdxPath, pdfDeckPath } from './path';
import { findPdfDeck, getTalks } from './talks';

vi.mock('@repo/api/build-data', () => ({ getTalks: vi.fn() }));
vi.mock('./path');

const manifest = {
  pages: [{ width: 1920, height: 1080, text: '表紙', notes: '', links: [] }],
};

const writeTemp = async (name: string, content: string): Promise<string> => {
  const path = join(await mkdtemp(join(tmpdir(), 'talk-deck-')), name);
  await writeFile(path, content);
  return path;
};

const talk = (overrides: Partial<Talk> = {}): Talk => ({
  id: 1,
  title: 'トーク',
  slug: null,
  eventUrl: 'https://example.com/event',
  eventName: 'イベント',
  eventDate: '2026-11-10',
  eventLocation: null,
  slideUrl: 'https://example.com/slides',
  blog: null,
  tags: [],
  ...overrides,
});

beforeEach(() => {
  vi.mocked(deckMdxPath).mockReturnValue('/no/such/content.mdx');
  vi.mocked(pdfDeckPath).mockReturnValue('/no/such/deck.json');
});

describe('findPdfDeck', () => {
  describe('正常系', () => {
    it('取り込んだマニフェストを返す', async () => {
      vi.mocked(pdfDeckPath).mockReturnValue(
        await writeTemp('deck.json', JSON.stringify(manifest)),
      );

      await expect(findPdfDeck('my-talk')).resolves.toStrictEqual(manifest);
    });
  });

  describe('異常系', () => {
    it('マニフェストが無ければ null を返す', async () => {
      await expect(findPdfDeck('missing')).resolves.toBeNull();
    });

    it('形の合わないマニフェストは投げる', async () => {
      vi.mocked(pdfDeckPath).mockReturnValue(
        await writeTemp('deck.json', JSON.stringify({ pages: [] })),
      );

      await expect(findPdfDeck('broken')).rejects.toThrow('"pages"');
    });
  });
});

describe('getTalks', () => {
  describe('正常系', () => {
    it('slug の無いトークはデッキを持たず、スライドは外の URL を指す', async () => {
      vi.mocked(readTalks).mockResolvedValue([talk()]);

      const [result] = await getTalks();

      expect(result).toMatchObject({
        deck: null,
        slidesHref: 'https://example.com/slides',
      });
    });

    it('PDF のマニフェストがあるトークは PDF のデッキを持ち、スライドはデッキのページを指す', async () => {
      vi.mocked(readTalks).mockResolvedValue([talk({ slug: 'my-talk' })]);
      vi.mocked(pdfDeckPath).mockReturnValue(
        await writeTemp('deck.json', JSON.stringify(manifest)),
      );

      const [result] = await getTalks();

      expect(result).toMatchObject({
        deck: { slug: 'my-talk', kind: 'pdf' },
        cover: {
          src: '/talks/my-talk/pages/001.1920w.avif',
          srcSet:
            '/talks/my-talk/pages/001.960w.avif 960w, /talks/my-talk/pages/001.1920w.avif 1920w',
          width: 1920,
          height: 1080,
        },
        slidesHref: '/talks/my-talk',
      });
    });

    it('MDX があるトークは、PDF のマニフェストがあっても MDX のデッキを持つ', async () => {
      vi.mocked(readTalks).mockResolvedValue([talk({ slug: 'my-talk' })]);
      vi.mocked(deckMdxPath).mockReturnValue(
        await writeTemp('content.mdx', ''),
      );
      vi.mocked(pdfDeckPath).mockReturnValue(
        await writeTemp('deck.json', JSON.stringify(manifest)),
      );

      const [result] = await getTalks();

      expect(result).toMatchObject({
        deck: { slug: 'my-talk', kind: 'mdx' },
        cover: null,
      });
    });
  });

  describe('異常系', () => {
    it('slug があっても中身の無いトークはデッキを持たず、警告を出して外の URL を指す', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(readTalks).mockResolvedValue([talk({ slug: 'my-talk' })]);

      const [result] = await getTalks();

      expect(result).toMatchObject({
        deck: null,
        slidesHref: 'https://example.com/slides',
      });
      expect(warn).toHaveBeenCalledWith(
        'トーク "my-talk" のデッキの MDX も PDF のマニフェストも無いため、デッキを出しません',
      );
      warn.mockRestore();
    });
  });

  describe('エッジケース', () => {
    it('デッキも外のスライドも無いトークは、スライドのリンク先を持たない', async () => {
      vi.mocked(readTalks).mockResolvedValue([talk({ slideUrl: null })]);

      const [result] = await getTalks();

      expect(result).toMatchObject({ deck: null, slidesHref: null });
    });

    it('slide_url が空の文字列のトークも、スライドのリンク先を持たない', async () => {
      vi.mocked(readTalks).mockResolvedValue([talk({ slideUrl: '' })]);

      const [result] = await getTalks();

      expect(result).toMatchObject({ slidesHref: null });
    });
  });
});
