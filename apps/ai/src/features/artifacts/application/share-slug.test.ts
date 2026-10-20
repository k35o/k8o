import { describe, expect, it } from 'vitest';

import { isShareSlug, newShareSlug } from './share-slug';

describe('newShareSlug', () => {
  describe('正常系', () => {
    it('作った slug は、公開ページが生成物の公開として見分ける形になる', () => {
      expect(isShareSlug(newShareSlug())).toBe(true);
    });
  });
});

describe('isShareSlug', () => {
  describe('正常系', () => {
    it('16 文字の base64url は生成物の公開とする', () => {
      expect(isShareSlug('Ab3-_xYz09KLmnOP')).toBe(true);
    });
  });

  describe('異常系', () => {
    it.each([
      ['空文字', ''],
      ['15 文字', 'Ab3-_xYz09KLmnO'],
      ['17 文字', 'Ab3-_xYz09KLmnOPq'],
      ['16 進 12 桁', '0a1b2c3d4e5f'],
      ['base64url に無い文字を含む 16 文字', 'Ab3+/xYz09KLmnOP'],
      ['パスのような値', '../../etc/passwd'],
    ])('%s は、生成物の公開としない', (_, slug) => {
      expect(isShareSlug(slug)).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('16 進だけの 16 文字は、長さで生成物の公開とする', () => {
      expect(isShareSlug('0123456789abcdef')).toBe(true);
    });
  });
});
