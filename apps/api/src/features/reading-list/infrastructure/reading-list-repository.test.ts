import { db } from '@repo/database';

import {
  insertArticlesIgnoringDuplicates,
  releaseSummaryAttempt,
  reserveSummaryAttempt,
  saveArticleSummary,
} from './reading-list-repository';

vi.mock('@repo/database', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    _schema: {
      articles: {
        id: 'articles.id',
        url: 'articles.url',
        summary: 'articles.summary',
        summaryAttempts: 'articles.summary_attempts',
      },
    },
  },
}));

vi.mock('@repo/database/orm', () => ({
  and: (...conditions: unknown[]) => ({ and: conditions }),
  eq: (column: unknown, value: unknown) => ({ eq: [column, value] }),
  isNull: (column: unknown) => ({ isNull: column }),
}));

const mockUpdate = (rowsAffected = 1) => {
  const where = vi.fn().mockResolvedValue({ rowsAffected });
  const set = vi.fn().mockReturnValue({ where });
  vi.mocked(db.update).mockReturnValue({ set } as never);
  return { set, where };
};

describe('insertArticlesIgnoringDuplicates', () => {
  it('URL重複をonConflictDoNothingで握り、cronの二重起動でも冪等に挿入する', async () => {
    const onConflictDoNothing = vi.fn();
    const values = vi.fn().mockReturnValue({ onConflictDoNothing });
    vi.mocked(db.insert).mockReturnValue({ values } as never);

    const row = {
      articleSourceId: 1,
      title: '記事',
      url: 'https://example.com/a',
      publishedAt: '2026-01-01T00:00:00.000Z',
      imageUrl: null,
      description: null,
    };
    await insertArticlesIgnoringDuplicates([row]);

    expect(db.insert).toHaveBeenCalledWith(db._schema.articles);
    expect(values).toHaveBeenCalledWith([row]);
    expect(onConflictDoNothing).toHaveBeenCalledWith({
      target: db._schema.articles.url,
    });
  });
});

describe('reserveSummaryAttempt', () => {
  describe('正常系', () => {
    it('読んだ試行回数と一致する未要約の記事だけを1増やす', async () => {
      const { set, where } = mockUpdate();

      const reserved = await reserveSummaryAttempt(1, 2);

      expect(reserved).toBe(true);
      expect(set).toHaveBeenCalledWith({ summaryAttempts: 3 });
      expect(where).toHaveBeenCalledWith({
        and: [
          { eq: ['articles.id', 1] },
          { isNull: 'articles.summary' },
          { eq: ['articles.summary_attempts', 2] },
        ],
      });
    });
  });

  describe('エッジケース', () => {
    it('ほかの実行が先に増やしていたら予約できない', async () => {
      mockUpdate(0);

      await expect(reserveSummaryAttempt(1, 2)).resolves.toBe(false);
    });
  });
});

describe('releaseSummaryAttempt', () => {
  it('予約した値のままのときだけ、読んだ試行回数に戻す', async () => {
    const { set, where } = mockUpdate();

    await releaseSummaryAttempt(1, 2);

    expect(set).toHaveBeenCalledWith({ summaryAttempts: 2 });
    expect(where).toHaveBeenCalledWith({
      and: [
        { eq: ['articles.id', 1] },
        { eq: ['articles.summary_attempts', 3] },
      ],
    });
  });
});

describe('saveArticleSummary', () => {
  it('まだ要約の無い記事にだけ保存する', async () => {
    const { set, where } = mockUpdate();

    await expect(saveArticleSummary(1, '要約')).resolves.toBe(true);

    expect(set).toHaveBeenCalledWith({ summary: '要約' });
    expect(where).toHaveBeenCalledWith({
      and: [{ eq: ['articles.id', 1] }, { isNull: 'articles.summary' }],
    });
  });

  it('ほかの実行が先に保存していたら false を返す', async () => {
    mockUpdate(0);

    await expect(saveArticleSummary(1, '要約')).resolves.toBe(false);
  });
});
