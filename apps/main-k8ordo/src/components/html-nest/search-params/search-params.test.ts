import { describe, expect, it } from 'vitest';

import { htmlNestState, readNestUrl } from './search-params';

const read = (value: string) =>
  readNestUrl(htmlNestState.parseUrl(new URLSearchParams([['el', value]])));

describe('htmlNestState の URL の読み', () => {
  describe('正常系', () => {
    it('キーが無ければ既定の div になる', () => {
      expect(readNestUrl(htmlNestState.parseUrl(new URLSearchParams()))).toBe(
        'div',
      );
    });

    it.each(['div', 'a', 'svg', 'h1', 'math'])(
      'el=%s はそのまま読む',
      (input) => {
        expect(read(input)).toBe(input);
      },
    );
  });

  describe('異常系', () => {
    it.each(['zzz', '', 'a b'])('el=%j は既定の div になる', (input) => {
      expect(read(input)).toBe('div');
    });
  });

  describe('エッジケース', () => {
    it('大文字小文字を区別する', () => {
      expect(read('DIV')).toBe('div');
      expect(read('A')).toBe('div');
    });

    it('同じキーが複数あれば最初の値を読む', () => {
      expect(
        readNestUrl(htmlNestState.parseUrl(new URLSearchParams('el=a&el=svg'))),
      ).toBe('a');
    });
  });
});

describe('htmlNestState の URL の書き', () => {
  describe('正常系', () => {
    it('要素を el に書く', () => {
      expect(htmlNestState.search({ el: 'svg' })).toBe('el=svg');
    });
  });

  describe('エッジケース', () => {
    it('既定の div は書かない', () => {
      expect(htmlNestState.search({ el: 'div' })).toBe('');
    });

    it('表に無いタグは読むときだけ既定になり、URL の文字列は残る', () => {
      expect(
        htmlNestState.search(
          htmlNestState.parseUrl(new URLSearchParams('el=zzz')),
        ),
      ).toBe('el=zzz');
    });
  });
});
