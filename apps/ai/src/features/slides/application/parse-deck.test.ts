import { extractCodeBlocks, parseDeck } from './parse-deck';

describe('parseDeck', () => {
  describe('正常系', () => {
    it('--- 区切りでスライドに分割できる', () => {
      const deck = parseDeck(
        ['## 1枚目', '本文1', '---', '## 2枚目', '本文2'].join('\n'),
      );
      expect(deck).toHaveLength(2);
      expect(deck[0]?.source).toContain('## 1枚目');
      expect(deck[1]?.source).toContain('本文2');
    });

    it('Cover タグで囲まれたスライドを表紙として判定し、タグを取り除く', () => {
      const deck = parseDeck(
        ['<Cover>', '# タイトル', '## サブタイトル', '</Cover>'].join('\n'),
      );
      expect(deck).toHaveLength(1);
      expect(deck[0]?.isCover).toBe(true);
      expect(deck[0]?.source).toBe('# タイトル\n## サブタイトル');
    });

    it('Notes タグの中身をノートとして抽出し、本文から取り除く', () => {
      const deck = parseDeck(
        ['## 見出し', '本文', '<Notes>', '発表者メモ', '</Notes>'].join('\n'),
      );
      expect(deck[0]?.notes).toStrictEqual(['発表者メモ']);
      expect(deck[0]?.source).toBe('## 見出し\n本文');
    });

    it('コードフェンス内の --- では分割しない', () => {
      const deck = parseDeck(
        [
          '## コード',
          '```yaml',
          '---',
          'key: value',
          '```',
          '---',
          '## 次',
        ].join('\n'),
      );
      expect(deck).toHaveLength(2);
      expect(deck[0]?.source).toContain('key: value');
      expect(deck[1]?.source).toBe('## 次');
    });
  });

  describe('異常系', () => {
    it('ストリーミング途中の未閉 Notes は本文に混ぜずノート扱いにする', () => {
      const deck = parseDeck(
        ['## 見出し', '本文', '<Notes>', '途中のメモ'].join('\n'),
      );
      expect(deck[0]?.source).toBe('## 見出し\n本文');
      expect(deck[0]?.notes).toStrictEqual(['途中のメモ']);
    });

    it('ストリーミング途中の未閉 Cover は表紙として描画できる', () => {
      const deck = parseDeck(['<Cover>', '# タイトル'].join('\n'));
      expect(deck[0]?.isCover).toBe(true);
      expect(deck[0]?.source).toBe('# タイトル');
    });

    it('末尾の書きかけタグ（<Cov など）は本文から捨てる', () => {
      const deck = parseDeck(['## 見出し', '本文', '<Not'].join('\n'));
      expect(deck[0]?.source).toBe('## 見出し\n本文');
    });
  });

  describe('エッジケース', () => {
    it('空文字・空白のみは空配列を返す', () => {
      expect(parseDeck('')).toStrictEqual([]);
      expect(parseDeck('  \n  ')).toStrictEqual([]);
    });

    it('末尾が --- で終わる（次スライドが未着）とき空スライドを作らない', () => {
      const deck = parseDeck(['## 1枚目', '---', ''].join('\n'));
      expect(deck).toHaveLength(1);
    });

    it('途中の空スライドは維持する（作者のミスが見えるように）', () => {
      const deck = parseDeck(['## 1枚目', '---', '---', '## 3枚目'].join('\n'));
      expect(deck).toHaveLength(3);
      expect(deck[1]?.source).toBe('');
    });

    it('数式の不等号（a < b）を末尾タグとして誤って捨てない', () => {
      const deck = parseDeck('## 見出し\na < b');
      expect(deck[0]?.source).toBe('## 見出し\na < b');
    });
  });
});

describe('extractCodeBlocks', () => {
  describe('正常系', () => {
    it('言語付きコードブロックを列挙できる', () => {
      const blocks = extractCodeBlocks(
        ['## 見出し', '```ts', 'const a = 1;', '```', '本文'].join('\n'),
      );
      expect(blocks).toStrictEqual([{ code: 'const a = 1;', lang: 'ts' }]);
    });

    it('複数ブロックを順番どおりに返し、言語なしは text にする', () => {
      const blocks = extractCodeBlocks(
        ['```js', 'x', '```', '間', '```', 'plain', '```'].join('\n'),
      );
      expect(blocks).toStrictEqual([
        { code: 'x', lang: 'js' },
        { code: 'plain', lang: 'text' },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('コードブロックが無ければ空配列を返す', () => {
      expect(extractCodeBlocks('## 見出し\n本文')).toStrictEqual([]);
    });

    it('閉じフェンス未到達（ストリーミング途中）のブロックは含めない', () => {
      const blocks = extractCodeBlocks(['```ts', 'const a ='].join('\n'));
      expect(blocks).toStrictEqual([]);
    });
  });
});
