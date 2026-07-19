import { matchesSearchQuery } from './search-filter';

describe('matchesSearchQuery', () => {
  describe('正常系', () => {
    it('いずれかのテキストに部分一致すれば true を返すべき', () => {
      expect(matchesSearchQuery('grid', ['CSS Grid', 'レイアウト'])).toBe(true);
    });

    it('どのテキストにも一致しなければ false を返すべき', () => {
      expect(matchesSearchQuery('flexbox', ['CSS Grid', 'レイアウト'])).toBe(
        false,
      );
    });

    it('大文字小文字を無視して一致させるべき', () => {
      expect(matchesSearchQuery('REACT', ['React Hooks'])).toBe(true);
    });

    it('複数トークンは AND で評価すべき', () => {
      expect(matchesSearchQuery('react hooks', ['React Hooks 入門'])).toBe(
        true,
      );
      expect(matchesSearchQuery('react vue', ['React Hooks 入門'])).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('空クエリは常に true を返すべき（絞り込みなし）', () => {
      expect(matchesSearchQuery('', ['なんでも'])).toBe(true);
    });

    it('空白のみのクエリも true を返すべき', () => {
      expect(matchesSearchQuery('   ', ['なんでも'])).toBe(true);
    });

    it('全角英数を正規化して一致させるべき（Ｒｅａｃｔ → React）', () => {
      expect(matchesSearchQuery('Ｒｅａｃｔ', ['React Hooks'])).toBe(true);
    });

    it('全角スペース区切りのトークンも AND 評価すべき', () => {
      expect(matchesSearchQuery('react　hooks', ['React Hooks'])).toBe(true);
    });

    it('テキストが空配列なら空クエリ以外は false を返すべき', () => {
      expect(matchesSearchQuery('anything', [])).toBe(false);
      expect(matchesSearchQuery('', [])).toBe(true);
    });
  });
});
