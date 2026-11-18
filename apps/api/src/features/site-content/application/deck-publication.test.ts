import { describe, expect, it } from 'vitest';

import { publishedDeckSlug } from './deck-publication';

const now = new Date('2026-11-21T06:20:00.000Z');

describe('publishedDeckSlug', () => {
  describe('正常系', () => {
    it('公開時刻を過ぎたデッキの slug を返す', () => {
      expect(
        publishedDeckSlug(
          { slug: 'talk', deckPublishedAt: '2026-11-21T15:19:59+09:00' },
          now,
        ),
      ).toBe('talk');
    });

    it('公開時刻より前のデッキは null を返す', () => {
      expect(
        publishedDeckSlug(
          { slug: 'talk', deckPublishedAt: '2026-11-21T15:20:01+09:00' },
          now,
        ),
      ).toBeNull();
    });

    it('公開時刻の無いデッキの slug を返す', () => {
      expect(
        publishedDeckSlug({ slug: 'talk', deckPublishedAt: null }, now),
      ).toBe('talk');
    });
  });

  describe('エッジケース', () => {
    it('公開時刻ちょうどのデッキの slug を返す', () => {
      expect(
        publishedDeckSlug(
          { slug: 'talk', deckPublishedAt: '2026-11-21T15:20:00+09:00' },
          now,
        ),
      ).toBe('talk');
    });

    it('slug の無いトークは、公開時刻を過ぎていても null を返す', () => {
      expect(
        publishedDeckSlug(
          { slug: null, deckPublishedAt: '2026-01-01T00:00:00+09:00' },
          now,
        ),
      ).toBeNull();
    });
  });

  describe('異常系', () => {
    it('時刻として読めない公開時刻は、slug を添えて投げる', () => {
      expect(() =>
        publishedDeckSlug(
          { slug: 'talk', deckPublishedAt: '11/21 15:20' },
          now,
        ),
      ).toThrow(
        'トーク "talk" の deck_published_at を、オフセット付きの時刻として読めない: 11/21 15:20',
      );
    });

    it('オフセットの無い公開時刻は投げる', () => {
      expect(() =>
        publishedDeckSlug(
          { slug: 'talk', deckPublishedAt: '2026-11-21T15:20:00' },
          now,
        ),
      ).toThrow(
        'トーク "talk" の deck_published_at を、オフセット付きの時刻として読めない: 2026-11-21T15:20:00',
      );
    });
  });
});
