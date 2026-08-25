import { db } from '@repo/database';

import { insertArticlesIgnoringDuplicates } from './reading-list-repository';

vi.mock('@repo/database', () => ({
  db: {
    insert: vi.fn(),
    _schema: {
      articles: { url: 'articles.url' },
    },
  },
}));

vi.mock('./og-metadata', () => ({
  fetchOgMetadata: vi.fn(),
}));

describe('insertArticlesIgnoringDuplicates', () => {
  it('URL重複をonConflictDoNothingで握り、cronと手動同期の並走でも冪等に挿入する', async () => {
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
