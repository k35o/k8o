import { applyEdits, parseEdits } from './parse-edits';

const fence = (body: string, close = true): string =>
  ['```edits', body, ...(close ? ['```'] : [])].join('\n');

const block = (search: string, replace: string): string =>
  ['<<<<<<< SEARCH', search, '=======', replace, '>>>>>>> REPLACE'].join('\n');

describe('parseEdits', () => {
  describe('正常系', () => {
    it('単一の SEARCH/REPLACE ブロックを抽出できる', () => {
      // Arrange
      const raw = fence(block('const a = 1;', 'const a = 2;'));
      // Act
      const result = parseEdits(raw);
      // Assert
      expect(result.isOpen).toBe(true);
      expect(result.isComplete).toBe(true);
      expect(result.blocks).toStrictEqual([
        { search: 'const a = 1;', replace: 'const a = 2;' },
      ]);
    });

    it('複数ブロックを順番どおり抽出できる', () => {
      const raw = fence([block('a', 'b'), block('c', 'd')].join('\n'));
      const result = parseEdits(raw);
      expect(result.blocks).toStrictEqual([
        { search: 'a', replace: 'b' },
        { search: 'c', replace: 'd' },
      ]);
    });

    it('複数行の SEARCH/REPLACE を改行を保ったまま抽出できる', () => {
      const raw = fence(block('line1\nline2', 'new1\nnew2\nnew3'));
      const result = parseEdits(raw);
      expect(result.blocks).toStrictEqual([
        { search: 'line1\nline2', replace: 'new1\nnew2\nnew3' },
      ]);
    });

    it('REPLACE が空行なしのとき削除として空文字になる', () => {
      const raw = fence(
        ['<<<<<<< SEARCH', 'gone', '=======', '>>>>>>> REPLACE'].join('\n'),
      );
      const result = parseEdits(raw);
      expect(result.blocks).toStrictEqual([{ search: 'gone', replace: '' }]);
    });
  });

  describe('異常系', () => {
    it('edits フェンスが無ければ isOpen=false', () => {
      const result = parseEdits('```tsx\nconst a = 1;\n```');
      expect(result.isOpen).toBe(false);
      expect(result.blocks).toStrictEqual([]);
    });
  });

  describe('エッジケース', () => {
    it('ストリーミング途中（フェンス未閉）は完成ブロックだけ返し isComplete=false', () => {
      const raw = fence(
        [block('a', 'b'), '<<<<<<< SEARCH', '書きかけ'].join('\n'),
        false,
      );
      const result = parseEdits(raw);
      expect(result.isOpen).toBe(true);
      expect(result.isComplete).toBe(false);
      expect(result.blocks).toStrictEqual([{ search: 'a', replace: 'b' }]);
    });

    it('マーカー行の前後空白を許容する', () => {
      const raw = fence(
        ['  <<<<<<< SEARCH ', 'a', '======= ', 'b', ' >>>>>>> REPLACE'].join(
          '\n',
        ),
      );
      const result = parseEdits(raw);
      expect(result.blocks).toStrictEqual([{ search: 'a', replace: 'b' }]);
    });

    it('後続の json フェンスは edits の本文に含めない', () => {
      const raw = [
        fence(block('a', 'b')),
        '```json',
        '{"title":"t"}',
        '```',
      ].join('\n');
      const result = parseEdits(raw);
      expect(result.isComplete).toBe(true);
      expect(result.blocks).toStrictEqual([{ search: 'a', replace: 'b' }]);
    });
  });
});

describe('applyEdits', () => {
  describe('正常系', () => {
    it('完全一致するブロックを置き換える', () => {
      const result = applyEdits('const a = 1;\nconst b = 2;', [
        { search: 'const a = 1;', replace: 'const a = 9;' },
      ]);
      expect(result.code).toBe('const a = 9;\nconst b = 2;');
      expect(result.failed).toStrictEqual([]);
    });

    it('複数ブロックを上から順に適用する', () => {
      const result = applyEdits('a\nb\nc', [
        { search: 'a', replace: 'x' },
        { search: 'c', replace: 'z' },
      ]);
      expect(result.code).toBe('x\nb\nz');
      expect(result.failed).toStrictEqual([]);
    });

    it('REPLACE が空文字なら該当行を削除する（行フォールバック時）', () => {
      const result = applyEdits('a\nb \nc', [{ search: 'b', replace: '' }]);
      expect(result.code).toBe('a\nc');
      expect(result.failed).toStrictEqual([]);
    });
  });

  describe('異常系', () => {
    it('一致しないブロックは failed に番号（1始まり）を積み、他は適用する', () => {
      const result = applyEdits('a\nb', [
        { search: '存在しない', replace: 'x' },
        { search: 'b', replace: 'y' },
      ]);
      expect(result.code).toBe('a\ny');
      expect(result.failed).toStrictEqual([1]);
    });

    it('SEARCH が空のブロックは失敗として扱う', () => {
      const result = applyEdits('a', [{ search: '', replace: 'x' }]);
      expect(result.code).toBe('a');
      expect(result.failed).toStrictEqual([1]);
    });
  });

  describe('エッジケース', () => {
    it('最初の一致箇所だけを置き換える', () => {
      const result = applyEdits('dup\ndup', [{ search: 'dup', replace: 'x' }]);
      expect(result.code).toBe('x\ndup');
    });

    it('行末空白の差があっても行単位フォールバックで一致する', () => {
      const base = 'const a = 1;  \nconst b = 2;';
      const result = applyEdits(base, [
        { search: 'const a = 1;', replace: 'const a = 9;' },
      ]);
      expect(result.code).toBe('const a = 9;\nconst b = 2;');
      expect(result.failed).toStrictEqual([]);
    });

    it('前のブロックの適用結果に対して次のブロックが一致できる', () => {
      const result = applyEdits('a', [
        { search: 'a', replace: 'a\nb' },
        { search: 'b', replace: 'c' },
      ]);
      expect(result.code).toBe('a\nc');
    });
  });
});
