import { describe, expect, it, vi } from 'vitest';

import type { PublishedVersion } from '../infrastructure/npm-registry';
import {
  groupReleasesByMonth,
  latestReleaseOf,
  loadLatestReleases,
  loadReleases,
} from './releases';

const source = {
  packageName: '@k8ordo/ui',
  githubUrl: 'https://github.com/k35o/k8ordo',
};

describe('groupReleasesByMonth', () => {
  describe('正常系', () => {
    it('同じ月の版は、最後に出た版の 1 つにまとめる', () => {
      expect(
        groupReleasesByMonth(source, [
          { version: '2.3.0', publishedAt: '2026-11-06T01:00:00.000Z' },
          { version: '2.3.1', publishedAt: '2026-11-06T05:00:00.000Z' },
          { version: '3.0.0', publishedAt: '2026-11-13T02:00:00.000Z' },
        ]),
      ).toStrictEqual([
        {
          packageName: '@k8ordo/ui',
          version: '3.0.0',
          publishedAt: '2026-11-13T02:00:00.000Z',
          href: 'https://github.com/k35o/k8ordo/releases',
        },
      ]);
    });

    it('月が違う版は別々にまとめる', () => {
      expect(
        groupReleasesByMonth(source, [
          { version: '2.1.0', publishedAt: '2026-10-14T02:00:00.000Z' },
          { version: '2.2.0', publishedAt: '2026-10-25T02:00:00.000Z' },
          { version: '3.0.0', publishedAt: '2026-11-13T02:00:00.000Z' },
        ]).map(({ version }) => version),
      ).toStrictEqual(['2.2.0', '3.0.0']);
    });
  });

  describe('エッジケース', () => {
    it('レジストリの並びが公開の順でなくても、公開の遅い版を最後の版にする', () => {
      expect(
        groupReleasesByMonth(source, [
          { version: '1.1.0', publishedAt: '2026-08-20T00:00:00.000Z' },
          { version: '1.0.0', publishedAt: '2026-08-10T00:00:00.000Z' },
        ]).map(({ version }) => version),
      ).toStrictEqual(['1.1.0']);
    });

    it('プレリリースは数えない', () => {
      expect(
        groupReleasesByMonth(source, [
          { version: '3.0.0-beta.1', publishedAt: '2026-11-01T00:00:00.000Z' },
          { version: '3.0.0', publishedAt: '2026-11-13T02:00:00.000Z' },
        ]).map(({ version }) => version),
      ).toStrictEqual(['3.0.0']);
    });

    it('月の境は日本時間で分ける', () => {
      // UTC では 10 月 31 日、日本時間では 11 月 1 日
      expect(
        groupReleasesByMonth(source, [
          { version: '1.0.0', publishedAt: '2026-10-31T14:00:00.000Z' },
          { version: '1.0.1', publishedAt: '2026-10-31T16:00:00.000Z' },
        ]).map(({ version }) => version),
      ).toStrictEqual(['1.0.0', '1.0.1']);
    });
  });
});

// 表に無いパッケージは、レジストリが落ちているときと同じく投げる
const fakeRegistry =
  (table: Record<string, PublishedVersion[]>) =>
  async (packageName: string): Promise<PublishedVersion[]> => {
    const versions = table[packageName];
    if (versions === undefined) {
      throw new Error('registry is down');
    }
    return versions;
  };

const published = [
  { version: '1.0.0', publishedAt: '2026-11-13T02:00:00.000Z' },
];

describe('loadReleases', () => {
  describe('正常系', () => {
    it('npm のパッケージを持つものだけを読む', async () => {
      const releases = await loadReleases(
        [
          { npmPackageName: '@k8ordo/ui', githubUrl: source.githubUrl },
          {
            npmPackageName: null,
            githubUrl: 'https://github.com/k35o/dotfiles',
          },
        ],
        fakeRegistry({ '@k8ordo/ui': published }),
      );

      expect(
        releases.map(({ packageName, version }) => ({ packageName, version })),
      ).toStrictEqual([{ packageName: '@k8ordo/ui', version: '1.0.0' }]);
    });
  });

  describe('異常系', () => {
    it('読めなかったパッケージを除いて、読めたパッケージのリリースを返す', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const releases = await loadReleases(
        [
          { npmPackageName: 'broken', githubUrl: 'https://github.com/k35o/a' },
          { npmPackageName: 'fine', githubUrl: 'https://github.com/k35o/b' },
        ],
        fakeRegistry({ fine: published }),
      );

      expect(releases.map(({ packageName }) => packageName)).toStrictEqual([
        'fine',
      ]);
      warn.mockRestore();
    });
  });
});

describe('latestReleaseOf', () => {
  describe('正常系', () => {
    it('最後に公開された版を返す', () => {
      expect(
        latestReleaseOf([
          { version: '3.0.0', publishedAt: '2026-11-13T02:00:00.000Z' },
          { version: '2.3.1', publishedAt: '2026-11-06T05:00:00.000Z' },
        ]),
      ).toStrictEqual({
        version: '3.0.0',
        publishedAt: '2026-11-13T02:00:00.000Z',
      });
    });
  });

  describe('エッジケース', () => {
    it('プレリリースは数えない', () => {
      expect(
        latestReleaseOf([
          { version: '3.0.0', publishedAt: '2026-11-13T02:00:00.000Z' },
          {
            version: '4.0.0-beta.1',
            publishedAt: '2026-11-18T02:00:00.000Z',
          },
        ])?.version,
      ).toBe('3.0.0');
    });

    it('版が無ければ null を返す', () => {
      expect(latestReleaseOf([])).toBeNull();
    });
  });
});

describe('loadLatestReleases', () => {
  describe('異常系', () => {
    it('読めなかったパッケージを除いて、読めたパッケージの版を返す', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const releases = await loadLatestReleases(
        ['broken', 'fine'],
        fakeRegistry({
          fine: [{ version: '1.0.0', publishedAt: '2026-05-01T00:00:00.000Z' }],
        }),
      );

      expect(releases).toStrictEqual({
        fine: { version: '1.0.0', publishedAt: '2026-05-01T00:00:00.000Z' },
      });
      expect(warn).toHaveBeenCalledOnce();
      warn.mockRestore();
    });
  });
});
