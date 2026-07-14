import { parseSourceFormData } from './source-form-validation';

// reading-list-repository 経由の import 時に DB クライアントが生成されるのを防ぐ
vi.mock('@repo/database', () => ({ db: {} }));

const buildFormData = (overrides: Record<string, string> = {}): FormData => {
  const formData = new FormData();
  const fields = {
    title: 'web.dev',
    url: 'https://web.dev/feed.xml',
    siteUrl: 'https://web.dev',
    type: 'feed',
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
};

describe('parseSourceFormData', () => {
  describe('正常系', () => {
    it('全項目が正しければ data を返す', () => {
      const result = parseSourceFormData(buildFormData());

      expect(result).toStrictEqual({
        ok: true,
        data: {
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed',
        },
      });
    });

    it('type は manual も受け付ける', () => {
      const result = parseSourceFormData(buildFormData({ type: 'manual' }));

      expect(result).toStrictEqual({
        ok: true,
        data: {
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'manual',
        },
      });
    });
  });

  describe('異常系', () => {
    it.each(['title', 'url', 'siteUrl', 'type'])(
      '%s が空ならエラーを返す',
      (key) => {
        const result = parseSourceFormData(buildFormData({ [key]: '' }));

        expect(result).toStrictEqual({
          ok: false,
          error: '全ての項目を入力してください',
        });
      },
    );

    it('type が feed / manual 以外ならエラーを返す', () => {
      const result = parseSourceFormData(buildFormData({ type: 'rss' }));

      expect(result).toStrictEqual({
        ok: false,
        error: 'タイプはfeedまたはmanualを指定してください',
      });
    });

    it.each([
      ['URL として不正', 'not a url'],
      ['http スキーム', 'http://web.dev/feed.xml'],
      ['javascript スキーム', 'javascript:alert(1)'],
    ])('url が https でない(%s)ならエラーを返す', (_label, value) => {
      const result = parseSourceFormData(buildFormData({ url: value }));

      expect(result).toStrictEqual({
        ok: false,
        error: '有効なURL(https)を入力してください',
      });
    });

    it.each([
      ['URL として不正', 'not a url'],
      ['http スキーム', 'http://web.dev'],
      ['javascript スキーム', 'javascript:alert(1)'],
    ])('siteUrl が https でない(%s)ならエラーを返す', (_label, value) => {
      const result = parseSourceFormData(buildFormData({ siteUrl: value }));

      expect(result).toStrictEqual({
        ok: false,
        error: '有効なURL(https)を入力してください',
      });
    });
  });
});
