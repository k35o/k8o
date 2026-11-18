import { describe, expect, it } from 'vitest';

import {
  countChars,
  firstChars,
  truncateChars,
  truncateCharsWith,
} from './truncate-chars';

// 切り詰めた文は tool の出力やスレッドの題として保存され、次のターンで送り返されるので、書式を変えない
describe('truncateChars', () => {
  describe('正常系', () => {
    it('上限より短い文はそのまま返す', () => {
      expect(truncateChars('こんにちは', 10)).toBe('こんにちは');
    });

    it('上限を超えた文は先頭の上限の字数に … を付ける', () => {
      expect(truncateChars('あいうえおかきくけこ', 4)).toBe('あいうえ…');
    });
  });

  describe('エッジケース', () => {
    it('ちょうど上限の字数の文は … を付けない', () => {
      expect(truncateChars('あいうえ', 4)).toBe('あいうえ');
    });

    it('サロゲートペアを1字として数え、途中で切らない', () => {
      expect(truncateChars('😀😀😀', 3)).toBe('😀😀😀');
      expect(truncateChars('😀😀😀', 2)).toBe('😀😀…');
    });

    it('空の文は空のまま返す', () => {
      expect(truncateChars('', 3)).toBe('');
    });
  });
});

describe('truncateCharsWith', () => {
  const suffix = (total: number): string => `（全 ${total.toString()} 字）`;

  describe('正常系', () => {
    it('上限を超えた文は、先頭の上限の字数に全体の字数から作った文を付ける', () => {
      expect(truncateCharsWith('あいう😀お', 4, suffix)).toBe(
        'あいう😀（全 5 字）',
      );
    });
  });

  describe('エッジケース', () => {
    it('ちょうど上限の字数の文はそのまま返す', () => {
      expect(truncateCharsWith('あい😀', 3, suffix)).toBe('あい😀');
    });
  });
});

describe('firstChars', () => {
  describe('正常系', () => {
    it('サロゲートペアを1字として数えた、先頭の上限の字数を返す', () => {
      expect(firstChars('😀😀😀', 2)).toBe('😀😀');
    });
  });
});

describe('countChars', () => {
  describe('正常系', () => {
    it('サロゲートペアを1字として数える', () => {
      expect(countChars('あ😀')).toBe(2);
    });
  });
});
