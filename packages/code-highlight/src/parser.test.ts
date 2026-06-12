import { parseAnnotations } from './parser.ts';

describe('parseAnnotations', () => {
  describe('正常系', () => {
    it('// [!hl] を次の行のハイライト指示として扱い、ディレクティブ行はコードから削除する', () => {
      const input = ['// [!hl]', 'const x = 1;'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe('const x = 1;');
      expect(result.annotations).toEqual([[{ type: 'highlight' }]]);
    });

    it('# [!hl] のようなハッシュコメントも認識する', () => {
      const input = ['# [!hl]', 'x = 1'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe('x = 1');
      expect(result.annotations).toEqual([[{ type: 'highlight' }]]);
    });

    it('<!-- [!hl] --> のようなHTMLコメントも認識する', () => {
      const input = ['<!-- [!hl] -->', '<div></div>'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe('<div></div>');
      expect(result.annotations).toEqual([[{ type: 'highlight' }]]);
    });

    it('/* [!hl] */ のようなブロックコメントも認識する', () => {
      const input = ['/* [!hl] */', '.foo { color: red; }'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe('.foo { color: red; }');
      expect(result.annotations).toEqual([[{ type: 'highlight' }]]);
    });

    it('-- [!hl] のようなSQL/Luaコメントも認識する', () => {
      const input = ['-- [!hl]', 'SELECT * FROM users;'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe('SELECT * FROM users;');
      expect(result.annotations).toEqual([[{ type: 'highlight' }]]);
    });

    it('// [!callout: テキスト] をコールアウト指示として扱う', () => {
      const input = ['// [!callout: ここがポイント]', 'const x = 1;'].join(
        '\n',
      );
      const result = parseAnnotations(input);

      expect(result.code).toBe('const x = 1;');
      expect(result.annotations).toEqual([
        [{ type: 'callout', text: 'ここがポイント' }],
      ]);
    });

    it('// [!+] と // [!-] をdiff add/remove指示として扱う', () => {
      const input = [
        '// [!+]',
        'const added = 1;',
        '// [!-]',
        'const removed = 2;',
      ].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe(
        ['const added = 1;', 'const removed = 2;'].join('\n'),
      );
      expect(result.annotations).toEqual([
        [{ type: 'add' }],
        [{ type: 'remove' }],
      ]);
    });

    it('連続する指示は同じ対象行にまとめて適用される', () => {
      const input = ['// [!hl]', '// [!callout: 重要]', 'const x = 1;'].join(
        '\n',
      );
      const result = parseAnnotations(input);

      expect(result.code).toBe('const x = 1;');
      expect(result.annotations).toEqual([
        [{ type: 'highlight' }, { type: 'callout', text: '重要' }],
      ]);
    });

    it('// highlight も hl と同義として扱う', () => {
      const input = ['// [!highlight]', 'const x = 1;'].join('\n');
      const result = parseAnnotations(input);

      expect(result.annotations).toEqual([[{ type: 'highlight' }]]);
    });

    it('// [!og] をOGP用マーカーとして扱い、ディレクティブ行はコードから削除する', () => {
      const input = ['// [!og]', 'const x = 1;'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe('const x = 1;');
      expect(result.annotations).toEqual([[{ type: 'og' }]]);
    });
  });

  describe('異常系', () => {
    it('未知のディレクティブが書かれたコメントはそのままコードに残し注釈も付かない', () => {
      const input = ['// [!unknown]', 'const x = 1;'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe(input);
      expect(result.annotations).toEqual([[], []]);
    });

    it('コールアウト本文が空のときはディレクティブとして認識しない', () => {
      const input = ['// [!callout:   ]', 'const x = 1;'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe(input);
      expect(result.annotations).toEqual([[], []]);
    });
  });

  describe('エッジケース', () => {
    it('対象行のないトレーリングディレクティブは破棄する', () => {
      const input = ['const x = 1;', '// [!hl]'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe('const x = 1;');
      expect(result.annotations).toEqual([[]]);
    });

    it('空文字列を渡しても落ちない', () => {
      const result = parseAnnotations('');
      expect(result.code).toBe('');
      expect(result.annotations).toEqual([[]]);
    });

    it('コードに含まれる通常コメントには触れない', () => {
      const input = ['// 通常のコメント', 'const x = 1;'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe(input);
      expect(result.annotations).toEqual([[], []]);
    });

    it('インデントされたディレクティブも認識する', () => {
      const input = ['    // [!hl]', '    const x = 1;'].join('\n');
      const result = parseAnnotations(input);

      expect(result.code).toBe('    const x = 1;');
      expect(result.annotations).toEqual([[{ type: 'highlight' }]]);
    });
  });
});
