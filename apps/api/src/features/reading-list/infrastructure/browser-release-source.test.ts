import { safeFetch } from '@repo/helpers/url/safe-fetch';
import { describe, expect, it, vi } from 'vitest';

import { fetchBrowserReleaseItems } from './browser-release-source';

vi.mock('@repo/helpers/url/safe-fetch', () => ({
  safeFetch: vi.fn(),
}));

const URL =
  'https://raw.githubusercontent.com/mdn/browser-compat-data/main/browsers/chrome.json';

const jsonResponse = (body: unknown, status = 200): Response =>
  Response.json(body, { status });

const chrome = (releases: Record<string, unknown>): unknown => ({
  browsers: { chrome: { name: 'Chrome', releases } },
});

describe('fetchBrowserReleaseItems', () => {
  describe('正常系', () => {
    it('出荷済みの版を、ブラウザ名と版の題・リリースノートのリンク・公開日にする', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        jsonResponse(
          chrome({
            '157': {
              status: 'retired',
              release_date: '2026-11-03',
              release_notes: 'https://chromestatus.com/release-notes/157',
            },
            '158': {
              status: 'current',
              release_date: '2026-11-17',
              release_notes: 'https://chromestatus.com/release-notes/158',
            },
          }),
        ),
      );

      await expect(fetchBrowserReleaseItems(URL)).resolves.toStrictEqual([
        {
          title: 'Chrome 157',
          link: 'https://chromestatus.com/release-notes/157',
          publishedAt: '2026-11-03',
        },
        {
          title: 'Chrome 158',
          link: 'https://chromestatus.com/release-notes/158',
          publishedAt: '2026-11-17',
        },
      ]);
      expect(safeFetch).toHaveBeenCalledWith(URL, {
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe('エッジケース', () => {
    it('まだ出ていない版と ESR を出さない', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        jsonResponse(
          chrome({
            '159': {
              status: 'beta',
              release_date: '2026-12-01',
              release_notes: 'https://chromestatus.com/release-notes/159',
            },
            '160': { status: 'nightly', release_date: '2026-12-15' },
            '161': { status: 'planned' },
            '140': {
              status: 'esr',
              release_date: '2026-03-01',
              release_notes: 'https://example.com/140',
            },
          }),
        ),
      );

      await expect(fetchBrowserReleaseItems(URL)).resolves.toStrictEqual([]);
    });

    it('公開日かリリースノートの無い版を出さない', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        jsonResponse(
          chrome({
            '1': { status: 'retired', release_date: '2008-12-11' },
            '2': {
              status: 'retired',
              release_notes: 'https://example.com/2',
            },
          }),
        ),
      );

      await expect(fetchBrowserReleaseItems(URL)).resolves.toStrictEqual([]);
    });
  });

  describe('異常系', () => {
    it('ステータスが ok でなければ投げる', async () => {
      vi.mocked(safeFetch).mockResolvedValue(jsonResponse({}, 503));

      await expect(fetchBrowserReleaseItems(URL)).rejects.toThrow(
        '版の一覧の取得失敗: 503',
      );
    });

    it('形の違う JSON なら投げる', async () => {
      vi.mocked(safeFetch).mockResolvedValue(jsonResponse({ browsers: [] }));

      await expect(fetchBrowserReleaseItems(URL)).rejects.toThrow(/invalid/iu);
    });
  });
});
