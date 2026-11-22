import { describe, expect, it, vi } from 'vitest';

import { OgImage } from '@/components/site/og-image/og-image';
import {
  findTalkDeck,
  readDeckCover,
} from '@/features/talks/interface/queries';

import { GET as getOgImage } from '../routes/talks/[slug]/og.png/route';

vi.mock('@/features/talks/interface/queries', () => ({
  findTalkDeck: vi.fn(),
  readDeckCover: vi.fn(),
}));
vi.mock('@/components/site/og-image/og-image', () => ({
  OgImage: vi.fn(),
}));

type TalkDeck = NonNullable<Awaited<ReturnType<typeof findTalkDeck>>>;

const talkDeck = (deck: TalkDeck['deck']): TalkDeck => ({
  id: 1,
  title: 'トークの題',
  eventUrl: 'https://example.com/event',
  eventName: 'イベント',
  eventDate: '2026-11-22',
  eventLocation: null,
  blog: null,
  tags: [],
  deck,
  cover: null,
  slidesHref: `/talks/${deck.slug}`,
});

const requestOgImage = async (slug: string): Promise<Response> =>
  getOgImage({
    request: new Request(`http://k8ordo.localhost/talks/${slug}/og.png`),
    params: { slug },
  });

describe('GET /talks/:slug/og.png', () => {
  describe('正常系', () => {
    it('PDF から作ったデッキは、表紙の画像を渡して描いた画像をそのまま返す', async () => {
      const deck = { slug: 'my-talk', kind: 'pdf' } as const;
      const cover = new Uint8Array([1, 2, 3]);
      const image = new Response('png', {
        headers: { 'Content-Type': 'image/png' },
      });
      vi.mocked(findTalkDeck).mockResolvedValue(talkDeck(deck));
      vi.mocked(readDeckCover).mockResolvedValue(cover);
      vi.mocked(OgImage).mockResolvedValue(image);

      const res = await requestOgImage('my-talk');

      expect(res).toBe(image);
      expect(readDeckCover).toHaveBeenCalledWith(deck);
      expect(OgImage).toHaveBeenCalledWith({
        category: 'Talks',
        title: 'トークの題',
        cover,
      });
    });

    it('MDX のデッキは表紙の画像を渡さず、題で描く', async () => {
      vi.mocked(findTalkDeck).mockResolvedValue(
        talkDeck({ slug: 'my-talk', kind: 'mdx' }),
      );
      vi.mocked(readDeckCover).mockResolvedValue(null);
      vi.mocked(OgImage).mockResolvedValue(new Response('png'));

      await requestOgImage('my-talk');

      expect(OgImage).toHaveBeenCalledWith({
        category: 'Talks',
        title: 'トークの題',
        cover: undefined,
      });
    });
  });

  describe('異常系', () => {
    it('デッキの無い slug は 404 を返し、表紙の画像を読みに行かない', async () => {
      vi.mocked(findTalkDeck).mockResolvedValue(undefined);

      const res = await requestOgImage('missing-talk');

      expect(res.status).toBe(404);
      expect(readDeckCover).not.toHaveBeenCalled();
    });

    it('表紙の画像を読めないときは、題の画像に替えず失敗させる（ビルドを止める）', async () => {
      vi.mocked(findTalkDeck).mockResolvedValue(
        talkDeck({ slug: 'my-talk', kind: 'pdf' }),
      );
      vi.mocked(readDeckCover).mockRejectedValue(
        new Error('ENOENT: no such file or directory'),
      );

      await expect(requestOgImage('my-talk')).rejects.toThrow('ENOENT');
      expect(OgImage).not.toHaveBeenCalled();
    });
  });
});
