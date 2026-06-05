import {
  buildSearchString,
  firstParam,
  getTotalPages,
  parsePageParam,
} from './search-params';

describe('firstParam', () => {
  describe('正常系', () => {
    it('文字列はそのまま返す', () => {
      expect(firstParam('a')).toBe('a');
    });
  });

  describe('エッジケース', () => {
    it('配列は undefined', () => {
      expect(firstParam(['a', 'b'])).toBeUndefined();
    });

    it('未指定は undefined', () => {
      expect(firstParam(undefined)).toBeUndefined();
    });
  });
});

describe('buildSearchString', () => {
  describe('正常系', () => {
    it('キーを追加できる', () => {
      expect(buildSearchString('', { q: 'hello' })).toBe('?q=hello');
    });

    it('既存値を更新できる', () => {
      expect(buildSearchString('q=old&page=2', { q: 'new' })).toBe(
        '?q=new&page=2',
      );
    });

    it('null のキーは削除する', () => {
      expect(buildSearchString('q=hello&page=3', { page: null })).toBe(
        '?q=hello',
      );
    });

    it('空文字のキーは削除する', () => {
      expect(buildSearchString('q=hello', { q: '' })).toBe('');
    });
  });

  describe('エッジケース', () => {
    it('全キー削除で空文字を返す', () => {
      expect(buildSearchString('q=a', { q: null })).toBe('');
    });

    it('複数の更新を同時に適用する', () => {
      expect(buildSearchString('page=5', { q: 'x', page: null })).toBe('?q=x');
    });
  });
});

describe('parsePageParam', () => {
  describe('正常系', () => {
    it('整数文字列をそのまま返す', () => {
      expect(parsePageParam('3')).toBe(3);
    });
  });

  describe('異常系', () => {
    it('未指定は 1', () => {
      expect(parsePageParam(undefined)).toBe(1);
    });

    it('0 以下は 1', () => {
      expect(parsePageParam('0')).toBe(1);
      expect(parsePageParam('-2')).toBe(1);
    });

    it('数値でない文字列は 1', () => {
      expect(parsePageParam('abc')).toBe(1);
    });

    it('小数は 1', () => {
      expect(parsePageParam('1.5')).toBe(1);
    });
  });
});

describe('getTotalPages', () => {
  describe('正常系', () => {
    it('割り切れる場合', () => {
      expect(getTotalPages(40, 20)).toBe(2);
    });

    it('端数は切り上げる', () => {
      expect(getTotalPages(41, 20)).toBe(3);
    });
  });

  describe('エッジケース', () => {
    it('0 件でも 1 ページ', () => {
      expect(getTotalPages(0, 20)).toBe(1);
    });
  });
});
