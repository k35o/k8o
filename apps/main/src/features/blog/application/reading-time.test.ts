import { estimateReadingTimeMinutes } from './reading-time';

describe('estimateReadingTimeMinutes', () => {
  describe('正常系', () => {
    it('日本語の文字数から読了時間を見積もる', () => {
      // 1000文字 / 500cpm = 2分
      const result = estimateReadingTimeMinutes('あ'.repeat(1000));

      expect(result).toBe(2);
    });

    it('英単語数から読了時間を見積もる', () => {
      // 500語 / 250wpm = 2分
      const text = Array.from({ length: 500 }, () => 'word').join(' ');

      expect(estimateReadingTimeMinutes(text)).toBe(2);
    });

    it('日本語と英語を合算して切り上げる', () => {
      // 250文字/500 + 125語/250 = 0.5 + 0.5 = 1分
      const words = Array.from({ length: 125 }, () => 'word').join(' ');
      const text = `${'あ'.repeat(250)} ${words}`;

      expect(estimateReadingTimeMinutes(text)).toBe(1);
    });
  });

  describe('エッジケース', () => {
    it('コードブロックは読了時間に含めない', () => {
      const text = ['```ts', 'const x = 1;'.repeat(500), '```'].join('\n');

      expect(estimateReadingTimeMinutes(text)).toBe(1);
    });

    it('リンクはテキストのみカウントしURLは除外する', () => {
      const text = '[リンク](https://example.com/very/long/path/to/article)';

      expect(estimateReadingTimeMinutes(text)).toBe(1);
    });

    it('短い本文でも最低1分を返す', () => {
      expect(estimateReadingTimeMinutes('短い')).toBe(1);
    });

    it('空文字でも1分を返す', () => {
      expect(estimateReadingTimeMinutes('')).toBe(1);
    });
  });
});
