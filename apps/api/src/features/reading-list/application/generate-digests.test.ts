import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findDigestKeysSince,
  saveDigest,
} from '../infrastructure/digest-repository';
import { writeDigest } from '../infrastructure/digest-writer';
import { findRecentArticles } from '../infrastructure/reading-list-repository';
import type { ReadingArticle } from '../infrastructure/reading-list-repository';
import { generateDigests } from './generate-digests';

vi.mock('../infrastructure/digest-repository', () => ({
  findDigestKeysSince: vi.fn(),
  saveDigest: vi.fn(),
}));
vi.mock('../infrastructure/digest-writer', () => ({
  writeDigest: vi.fn(),
}));
vi.mock('../infrastructure/reading-list-repository', () => ({
  findRecentArticles: vi.fn(),
}));

const NOW = Date.parse('2026-11-20T00:00:00.000Z');
const FAR = NOW + 60_000;

const article = (id: number, publishedAt: string): ReadingArticle => ({
  id,
  title: `記事${id}`,
  url: `https://example.com/${id}`,
  publishedAt,
  imageUrl: null,
  summary: `本文${id}`,
  description: null,
  sourceTitle: 'Example',
});

describe('generateDigests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(findDigestKeysSince).mockResolvedValue([]);
    vi.mocked(writeDigest).mockImplementation(async (articles) => ({
      kind: 'written',
      digest: {
        overview: '全体像',
        picks: [],
        topics: [
          {
            kind: 'release',
            headline: '話題',
            articleIds: articles.map(({ id }) => id),
          },
        ],
      },
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('話題の無い日を、日本時間の日ごとにまとめて作る', async () => {
      vi.mocked(findRecentArticles).mockResolvedValue([
        article(3, '2026-11-18T16:00:00.000Z'),
        article(2, '2026-11-18T03:00:00.000Z'),
        article(1, '2026-11-18T01:00:00.000Z'),
      ]);

      const result = await generateDigests(NOW, FAR);

      expect(result).toStrictEqual({
        writtenDigests: 2,
        failedDigests: 0,
        digestAborted: false,
      });
      expect(
        vi.mocked(saveDigest).mock.calls.map(([digest]) => digest),
      ).toStrictEqual([
        {
          date: '2026-11-19',
          overview: '全体像',
          picks: [],
          topics: [{ kind: 'release', headline: '話題', articleIds: [3] }],
          articleKey: '3',
        },
        {
          date: '2026-11-18',
          overview: '全体像',
          picks: [],
          topics: [{ kind: 'release', headline: '話題', articleIds: [2, 1] }],
          articleKey: '1,2',
        },
      ]);
    });

    it('書き手には、その日の記事を新しい順に渡す', async () => {
      vi.mocked(findRecentArticles).mockResolvedValue([
        article(2, '2026-11-19T03:00:00.000Z'),
        article(1, '2026-11-19T01:00:00.000Z'),
      ]);

      await generateDigests(NOW, FAR);

      expect(
        vi
          .mocked(writeDigest)
          .mock.calls.map(([articles]) => articles.map(({ id }) => id)),
      ).toStrictEqual([[2, 1]]);
    });

    it('直近の日は、記事が増えていたら作り直す', async () => {
      vi.mocked(findRecentArticles).mockResolvedValue([
        article(2, '2026-11-19T03:00:00.000Z'),
        article(1, '2026-11-19T01:00:00.000Z'),
      ]);
      vi.mocked(findDigestKeysSince).mockResolvedValue([
        { date: '2026-11-19', articleKey: '1' },
      ]);

      const result = await generateDigests(NOW, FAR);

      expect(result.writtenDigests).toBe(1);
    });
  });

  describe('エッジケース', () => {
    it('日本時間でまだ終わっていない日は作らない', async () => {
      vi.mocked(findRecentArticles).mockResolvedValue([
        article(2, '2026-11-19T16:00:00.000Z'),
        article(1, '2026-11-19T14:00:00.000Z'),
      ]);

      const result = await generateDigests(NOW, FAR);

      expect(
        vi.mocked(saveDigest).mock.calls.map(([digest]) => digest.date),
      ).toStrictEqual(['2026-11-19']);
      expect(result.writtenDigests).toBe(1);
    });

    it('記事が同じ日は作り直さない', async () => {
      vi.mocked(findRecentArticles).mockResolvedValue([
        article(1, '2026-11-19T01:00:00.000Z'),
      ]);
      vi.mocked(findDigestKeysSince).mockResolvedValue([
        { date: '2026-11-19', articleKey: '1' },
      ]);

      await generateDigests(NOW, FAR);

      expect(writeDigest).not.toHaveBeenCalled();
    });

    it('古い日は、記事が増えていても作り直さない', async () => {
      vi.mocked(findRecentArticles).mockResolvedValue([
        article(2, '2026-11-10T03:00:00.000Z'),
        article(1, '2026-11-10T01:00:00.000Z'),
      ]);
      vi.mocked(findDigestKeysSince).mockResolvedValue([
        { date: '2026-11-10', articleKey: '1' },
      ]);

      await generateDigests(NOW, FAR);

      expect(writeDigest).not.toHaveBeenCalled();
    });

    it('1 回に作るのは新しい日から 10 日分まで', async () => {
      vi.mocked(findRecentArticles).mockResolvedValue(
        Array.from({ length: 12 }, (_, index) =>
          article(
            100 - index,
            new Date(NOW - index * 86_400_000 - 3_600_000).toISOString(),
          ),
        ),
      );

      const result = await generateDigests(NOW, FAR);

      expect(result.writtenDigests).toBe(10);
      expect(vi.mocked(saveDigest).mock.calls.at(-1)?.[0].date).toBe(
        '2026-11-10',
      );
    });

    it('締め切りを過ぎたら、残りの日を次の回に回す', async () => {
      vi.mocked(findRecentArticles).mockResolvedValue([
        article(2, '2026-11-19T16:00:00.000Z'),
        article(1, '2026-11-19T01:00:00.000Z'),
      ]);

      const result = await generateDigests(NOW, NOW);

      expect(result.writtenDigests).toBe(0);
      expect(writeDigest).not.toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('話題の形にならなかった日を飛ばして、次の日を作る', async () => {
      vi.mocked(findRecentArticles).mockResolvedValue([
        article(2, '2026-11-18T16:00:00.000Z'),
        article(1, '2026-11-18T01:00:00.000Z'),
      ]);
      vi.mocked(writeDigest).mockResolvedValueOnce({
        kind: 'failed',
        reason: '生成が終わらなかった',
      });

      const result = await generateDigests(NOW, FAR);

      expect(result).toStrictEqual({
        writtenDigests: 1,
        failedDigests: 1,
        digestAborted: false,
      });
    });

    it('API の呼び出しが投げたら、その回の生成をやめる', async () => {
      vi.mocked(findRecentArticles).mockResolvedValue([
        article(2, '2026-11-18T16:00:00.000Z'),
        article(1, '2026-11-18T01:00:00.000Z'),
      ]);
      vi.mocked(writeDigest).mockRejectedValue(new Error('429'));

      const result = await generateDigests(NOW, FAR);

      expect(result).toStrictEqual({
        writtenDigests: 0,
        failedDigests: 0,
        digestAborted: true,
      });
      expect(writeDigest).toHaveBeenCalledOnce();
    });
  });
});
