import { safeFetch } from '@repo/helpers/url/safe-fetch';
import { describe, expect, it, vi } from 'vitest';

import { fetchGithubReleaseItems } from './github-release-source';

vi.mock('@repo/helpers/url/safe-fetch', () => ({
  safeFetch: vi.fn(),
}));

const atomResponse = (
  repo: string,
  releases: Array<{ tag: string; updated: string }>,
): Response =>
  new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<feed xmlns="http://www.w3.org/2005/Atom">',
      `<title>Release notes from ${repo}</title>`,
      ...releases.map(({ tag, updated }) =>
        [
          '<entry>',
          `<title>${tag}</title>`,
          `<updated>${updated}</updated>`,
          `<link rel="alternate" type="text/html" href="https://github.com/${repo}/releases/tag/${encodeURIComponent(tag)}"/>`,
          '<content type="html">&lt;p&gt;notes&lt;/p&gt;</content>',
          '</entry>',
        ].join(''),
      ),
      '</feed>',
    ].join(''),
  );

describe('fetchGithubReleaseItems', () => {
  describe('正常系', () => {
    it('マイナー以上の版を、ライブラリ名と「メジャー.マイナー」の題・リリースのページ・公開日にする', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        atomResponse('colinhacks/zod', [
          { tag: 'v4.6.1', updated: '2026-10-02T00:00:00Z' },
          { tag: 'v4.6.0', updated: '2026-10-01T00:00:00Z' },
          { tag: 'v4.5.0', updated: '2026-09-01T00:00:00Z' },
        ]),
      );

      await expect(
        fetchGithubReleaseItems(
          'https://github.com/colinhacks/zod/releases.atom',
          'Zod',
        ),
      ).resolves.toStrictEqual([
        {
          title: 'Zod 4.6',
          link: 'https://github.com/colinhacks/zod/releases/tag/v4.6.0',
          publishedAt: '2026-10-01T00:00:00.000Z',
        },
        {
          title: 'Zod 4.5',
          link: 'https://github.com/colinhacks/zod/releases/tag/v4.5.0',
          publishedAt: '2026-09-01T00:00:00.000Z',
        },
      ]);
    });

    it('URL のフラグメントで、タグの頭が v 以外のリポジトリの版を選ぶ', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        atomResponse('oxc-project/oxc', [
          { tag: 'oxlint_v1.95.0', updated: '2026-11-20T00:00:00Z' },
          { tag: 'oxfmt_v0.80.0', updated: '2026-11-20T00:00:00Z' },
          { tag: 'crates_v0.160.0', updated: '2026-11-20T00:00:00Z' },
        ]),
      );

      await expect(
        fetchGithubReleaseItems(
          'https://github.com/oxc-project/oxc/releases.atom#oxlint_v',
          'oxlint',
        ),
      ).resolves.toStrictEqual([
        {
          title: 'oxlint 1.95',
          link: 'https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.95.0',
          publishedAt: '2026-11-20T00:00:00.000Z',
        },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('プレリリースと、同じリポジトリの別のパッケージの版を出さない', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        atomResponse('vitejs/vite', [
          { tag: 'v8.4.0-beta.1', updated: '2026-11-20T00:00:00Z' },
          { tag: 'plugin-legacy@8.3.0', updated: '2026-11-19T00:00:00Z' },
          { tag: 'v8.3.0', updated: '2026-11-18T00:00:00Z' },
        ]),
      );

      await expect(
        fetchGithubReleaseItems(
          'https://github.com/vitejs/vite/releases.atom',
          'Vite',
        ),
      ).resolves.toStrictEqual([
        {
          title: 'Vite 8.3',
          link: 'https://github.com/vitejs/vite/releases/tag/v8.3.0',
          publishedAt: '2026-11-18T00:00:00.000Z',
        },
      ]);
    });

    it('最新のメジャーより古い系統のマイナー版を出さない', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        atomResponse('pnpm/pnpm', [
          { tag: 'v12.23.0', updated: '2026-11-22T00:00:00Z' },
          { tag: 'v11.29.0', updated: '2026-11-22T00:00:00Z' },
        ]),
      );

      await expect(
        fetchGithubReleaseItems(
          'https://github.com/pnpm/pnpm/releases.atom',
          'pnpm',
        ),
      ).resolves.toStrictEqual([
        {
          title: 'pnpm 12.23',
          link: 'https://github.com/pnpm/pnpm/releases/tag/v12.23.0',
          publishedAt: '2026-11-22T00:00:00.000Z',
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('版の一覧を取得できなければ失敗にする', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        new Response('', { status: 404, statusText: 'Not Found' }),
      );

      await expect(
        fetchGithubReleaseItems(
          'https://github.com/colinhacks/zod/releases.atom',
          'Zod',
        ),
      ).rejects.toThrow('404');
    });
  });
});
