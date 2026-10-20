import { describe, expect, it } from 'vitest';

import { parseSpecProse } from './spec-message';

describe('parseSpecProse', () => {
  describe('正常系', () => {
    it('タイトル行と説明文を分離する', () => {
      expect(
        parseSpecProse('タイトル: 料金表\n3プランのカードを作りました。'),
      ).toStrictEqual({
        title: '料金表',
        description: '3プランのカードを作りました。',
      });
    });

    it('全角コロンも受け付ける', () => {
      expect(parseSpecProse('タイトル：問い合わせ\n説明')).toStrictEqual({
        title: '問い合わせ',
        description: '説明',
      });
    });
  });

  describe('異常系', () => {
    it('タイトル行が無ければ全文を説明として返す', () => {
      expect(parseSpecProse('できました。')).toStrictEqual({
        title: null,
        description: 'できました。',
      });
    });
  });

  describe('エッジケース', () => {
    it('空文字はタイトルなし・説明空', () => {
      expect(parseSpecProse('')).toStrictEqual({
        title: null,
        description: '',
      });
    });
  });
});
