import { parseTalkFormData } from './talk-form-validation';

const buildFormData = (
  overrides: Partial<Record<string, string>> = {},
): FormData => {
  const fields: Record<string, string> = {
    title: 'React のトーク',
    eventName: 'K8o Conference',
    eventDate: '2026-07-01',
    eventLocation: '東京',
    eventUrl: 'https://example.com/event',
    slideUrl: 'https://example.com/slide',
    blogId: '1',
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
};

describe('parseTalkFormData', () => {
  describe('正常系', () => {
    it('全項目が正しければ TalkInput を返す', () => {
      const result = parseTalkFormData(buildFormData());

      expect(result).toEqual({
        ok: true,
        data: {
          title: 'React のトーク',
          eventName: 'K8o Conference',
          eventDate: '2026-07-01',
          eventLocation: '東京',
          eventUrl: 'https://example.com/event',
          slideUrl: 'https://example.com/slide',
          blogId: 1,
        },
      });
    });

    it('任意項目の eventLocation が空なら null にする', () => {
      const result = parseTalkFormData(buildFormData({ eventLocation: '' }));

      expect(result).toMatchObject({
        ok: true,
        data: { eventLocation: null },
      });
    });
  });

  describe('異常系', () => {
    it.each([
      ['title'],
      ['eventName'],
      ['eventDate'],
      ['eventUrl'],
      ['slideUrl'],
    ])('必須項目 %s が空ならエラーを返す', (field) => {
      const result = parseTalkFormData(buildFormData({ [field]: '' }));

      expect(result).toEqual({
        ok: false,
        error: 'タイトル・イベント名・日付・イベントURL・スライドURLは必須です',
      });
    });

    it('フィールドが未設定でも必須エラーを返す', () => {
      const result = parseTalkFormData(new FormData());

      expect(result).toEqual({
        ok: false,
        error: 'タイトル・イベント名・日付・イベントURL・スライドURLは必須です',
      });
    });

    it('eventDate が YYYY-MM-DD 形式でなければエラーを返す', () => {
      const result = parseTalkFormData(
        buildFormData({ eventDate: '2026/07/01' }),
      );

      expect(result).toEqual({
        ok: false,
        error: '開催日は YYYY-MM-DD 形式で入力してください',
      });
    });

    it.each([['0'], ['-1'], ['1.5'], ['abc'], ['']])(
      'blogId が正の整数でない値(%s)ならエラーを返す',
      (blogId) => {
        const result = parseTalkFormData(buildFormData({ blogId }));

        expect(result).toEqual({
          ok: false,
          error: '紐づけるブログを選択してください',
        });
      },
    );

    it('eventUrl が URL としてパースできなければエラーを返す', () => {
      const result = parseTalkFormData(
        buildFormData({ eventUrl: 'not-a-url' }),
      );

      expect(result).toEqual({
        ok: false,
        error: '有効なURLを入力してください',
      });
    });

    it('slideUrl が URL としてパースできなければエラーを返す', () => {
      const result = parseTalkFormData(
        buildFormData({ slideUrl: 'example.com/slide' }),
      );

      expect(result).toEqual({
        ok: false,
        error: '有効なURLを入力してください',
      });
    });
  });

  describe('エッジケース', () => {
    it('blogId の前後の空白は数値として許容される', () => {
      const result = parseTalkFormData(buildFormData({ blogId: ' 2 ' }));

      expect(result).toMatchObject({
        ok: true,
        data: { blogId: 2 },
      });
    });
  });
});
