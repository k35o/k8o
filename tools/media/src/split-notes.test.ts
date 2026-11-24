import { describe, expect, it } from 'vitest';

import { splitNotes } from './split-notes.ts';

describe('splitNotes', () => {
  describe('正常系', () => {
    it('--- だけの行でページごとに分け、前後の空白を落とす', () => {
      expect(
        splitNotes('挨拶する\n\n---\n\n自己紹介は短く\n会社名を言う\n'),
      ).toStrictEqual(['挨拶する', '自己紹介は短く\n会社名を言う']);
    });
  });

  describe('エッジケース', () => {
    it('ノートの無いページは空の文字列になる', () => {
      expect(splitNotes('1 枚目\n---\n---\n3 枚目')).toStrictEqual([
        '1 枚目',
        '',
        '3 枚目',
      ]);
    });

    it('行の途中の --- では分けない', () => {
      expect(splitNotes('a --- b')).toStrictEqual(['a --- b']);
    });
  });
});
