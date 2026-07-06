import {
  parseArticleCreateFormData,
  parseArticleUpdateFormData,
} from './article-form-validation';

const buildCreateFormData = (
  overrides: Record<string, string> = {},
): FormData => {
  const formData = new FormData();
  const fields = {
    articleSourceId: '1',
    title: '記事タイトル',
    url: 'https://example.com/articles/1',
    publishedAt: '2026-03-10',
    description: '記事の説明',
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
};

const buildUpdateFormData = (
  overrides: Record<string, string> = {},
): FormData => {
  const formData = new FormData();
  const fields = {
    title: '記事タイトル',
    url: 'https://example.com/articles/1',
    publishedAt: '2026-03-10',
    description: '記事の説明',
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
};

describe('parseArticleCreateFormData', () => {
  describe('正常系', () => {
    it('全項目が正しければ data を返す', () => {
      const result = parseArticleCreateFormData(buildCreateFormData());

      expect(result).toEqual({
        ok: true,
        data: {
          articleSourceId: 1,
          title: '記事タイトル',
          url: 'https://example.com/articles/1',
          publishedAt: '2026-03-10',
          description: '記事の説明',
        },
      });
    });
  });

  describe('異常系', () => {
    it.each([
      ['未設定', ''],
      ['0', '0'],
      ['負値', '-1'],
      ['整数以外', '1.5'],
      ['数値以外', 'abc'],
    ])('articleSourceId が不正(%s)ならエラーを返す', (_label, value) => {
      const result = parseArticleCreateFormData(
        buildCreateFormData({ articleSourceId: value }),
      );

      expect(result).toEqual({
        ok: false,
        error: 'ソースを選択してください',
      });
    });

    it.each(['title', 'url', 'publishedAt'])(
      '%s が空ならエラーを返す',
      (key) => {
        const result = parseArticleCreateFormData(
          buildCreateFormData({ [key]: '' }),
        );

        expect(result).toEqual({
          ok: false,
          error: 'タイトル・URL・公開日は必須です',
        });
      },
    );

    it('publishedAt が YYYY-MM-DD 形式でなければエラーを返す', () => {
      const result = parseArticleCreateFormData(
        buildCreateFormData({ publishedAt: '2026/03/10' }),
      );

      expect(result).toEqual({
        ok: false,
        error: '公開日は YYYY-MM-DD 形式で入力してください',
      });
    });

    it.each([
      ['URL として不正', 'not a url'],
      ['http スキーム', 'http://example.com/articles/1'],
      ['javascript スキーム', 'javascript:alert(1)'],
    ])('url が https でない(%s)ならエラーを返す', (_label, value) => {
      const result = parseArticleCreateFormData(
        buildCreateFormData({ url: value }),
      );

      expect(result).toEqual({
        ok: false,
        error: '有効なURL(https)を入力してください',
      });
    });
  });

  describe('エッジケース', () => {
    it('description が空文字なら null に変換する', () => {
      const result = parseArticleCreateFormData(
        buildCreateFormData({ description: '' }),
      );

      expect(result).toEqual({
        ok: true,
        data: {
          articleSourceId: 1,
          title: '記事タイトル',
          url: 'https://example.com/articles/1',
          publishedAt: '2026-03-10',
          description: null,
        },
      });
    });
  });
});

describe('parseArticleUpdateFormData', () => {
  describe('正常系', () => {
    it('全項目が正しければ data を返す', () => {
      const result = parseArticleUpdateFormData(buildUpdateFormData());

      expect(result).toEqual({
        ok: true,
        data: {
          title: '記事タイトル',
          url: 'https://example.com/articles/1',
          publishedAt: '2026-03-10',
          description: '記事の説明',
        },
      });
    });
  });

  describe('異常系', () => {
    it.each(['title', 'url', 'publishedAt'])(
      '%s が空ならエラーを返す',
      (key) => {
        const result = parseArticleUpdateFormData(
          buildUpdateFormData({ [key]: '' }),
        );

        expect(result).toEqual({
          ok: false,
          error: 'タイトル・URL・公開日は必須です',
        });
      },
    );

    it('publishedAt が YYYY-MM-DD 形式でなければエラーを返す', () => {
      const result = parseArticleUpdateFormData(
        buildUpdateFormData({ publishedAt: '10 Mar 2026' }),
      );

      expect(result).toEqual({
        ok: false,
        error: '公開日は YYYY-MM-DD 形式で入力してください',
      });
    });

    it.each([
      ['URL として不正', 'not a url'],
      ['http スキーム', 'http://example.com/articles/1'],
      ['javascript スキーム', 'javascript:alert(1)'],
    ])('url が https でない(%s)ならエラーを返す', (_label, value) => {
      const result = parseArticleUpdateFormData(
        buildUpdateFormData({ url: value }),
      );

      expect(result).toEqual({
        ok: false,
        error: '有効なURL(https)を入力してください',
      });
    });
  });

  describe('エッジケース', () => {
    it('description が空文字なら null に変換する', () => {
      const result = parseArticleUpdateFormData(
        buildUpdateFormData({ description: '' }),
      );

      expect(result).toEqual({
        ok: true,
        data: {
          title: '記事タイトル',
          url: 'https://example.com/articles/1',
          publishedAt: '2026-03-10',
          description: null,
        },
      });
    });
  });
});
