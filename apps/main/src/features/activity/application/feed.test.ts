import { describe, expect, it } from 'vitest';

import { buildActivityFeed } from './feed';

const now = new Date('2026-11-19T03:00:00.000Z');

const talk = {
  id: 7,
  title: 'Panda CSSの話',
  eventName: 'JSConf JP 2026',
  eventUrl: 'https://example.com/jsconf',
  eventDate: '2026-11-22',
  slidesHref: null,
};

const release = {
  packageName: '@k8ordo/ui',
  version: '3.0.0',
  publishedAt: '2026-11-13T02:00:00.000Z',
  href: 'https://github.com/k35o/k8ordo/releases',
};

describe('buildActivityFeed', () => {
  describe('正常系', () => {
    it('記事・登壇・リリースを新しい順に混ぜる', () => {
      const feed = buildActivityFeed({
        blogs: [
          {
            slug: 'newer',
            title: '新しい記事',
            createdAt: '2026-11-15T00:00:00.000Z',
          },
          {
            slug: 'older',
            title: '古い記事',
            createdAt: '2026-10-01T00:00:00.000Z',
          },
        ],
        talks: [talk],
        releases: [release],
        now,
      });

      expect(feed.map(({ id }) => id)).toStrictEqual([
        'talk:7',
        'blog:newer',
        'release:@k8ordo/ui:3.0.0',
        'blog:older',
      ]);
    });

    it('記事は記事のページへつなぐ', () => {
      expect(
        buildActivityFeed({
          blogs: [
            {
              slug: 'scope',
              title: '@scope',
              createdAt: '2026-11-15T00:00:00.000Z',
            },
          ],
          talks: [],
          releases: [],
          now,
        }),
      ).toStrictEqual([
        {
          kind: 'blog',
          id: 'blog:scope',
          date: '2026-11-15T00:00:00.000Z',
          title: '@scope',
          href: '/blog/scope',
        },
      ]);
    });

    it('デッキのある登壇はデッキへ、無い登壇はイベントのページへつなぐ', () => {
      const feed = buildActivityFeed({
        blogs: [],
        talks: [
          { ...talk, id: 1, slidesHref: '/talks/panda' },
          { ...talk, id: 2 },
        ],
        releases: [],
        now,
      });

      expect(feed.map(({ href }) => href)).toStrictEqual([
        '/talks/panda',
        'https://example.com/jsconf',
      ]);
    });

    it('リリースはパッケージの名前と版を持つ', () => {
      expect(
        buildActivityFeed({ blogs: [], talks: [], releases: [release], now }),
      ).toStrictEqual([
        {
          kind: 'release',
          id: 'release:@k8ordo/ui:3.0.0',
          date: '2026-11-13T02:00:00.000Z',
          packageName: '@k8ordo/ui',
          version: '3.0.0',
          href: 'https://github.com/k35o/k8ordo/releases',
        },
      ]);
    });
  });

  describe('エッジケース', () => {
    const upcomingOf = (eventDate: string, at: Date): boolean | undefined => {
      const [item] = buildActivityFeed({
        blogs: [],
        talks: [{ ...talk, eventDate }],
        releases: [],
        now: at,
      });
      return item?.kind === 'talk' ? item.upcoming : undefined;
    };

    it('登壇の日が明日より先なら予定にする', () => {
      expect(upcomingOf('2026-11-22', now)).toBe(true);
    });

    it('登壇の当日は予定にしない', () => {
      expect(upcomingOf('2026-11-19', now)).toBe(false);
    });

    it('当日かどうかは日本時間の日付で決める', () => {
      // UTC では 11 月 21 日、日本時間では 11 月 22 日
      expect(
        upcomingOf('2026-11-22', new Date('2026-11-21T15:30:00.000Z')),
      ).toBe(false);
    });

    it('リリースが 1 つも無くても記事と登壇を並べる', () => {
      const feed = buildActivityFeed({
        blogs: [
          { slug: 'a', title: 'A', createdAt: '2026-11-15T00:00:00.000Z' },
        ],
        talks: [talk],
        releases: [],
        now,
      });

      expect(feed.map(({ kind }) => kind)).toStrictEqual(['talk', 'blog']);
    });
  });
});
