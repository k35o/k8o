import { resolveGeneration } from './resolve-generation';

const BASE = [
  'export default function Preview() {',
  '  return (',
  '    <div className="p-8">',
  '      <p>こんにちは</p>',
  '    </div>',
  '  );',
  '}',
].join('\n');

const META =
  '```json\n{"title":"t","description":"d","usedComponents":[],"changes":["c"]}\n```';

const editsFence = (body: string): string =>
  ['```edits', body, '```'].join('\n');

const editBlock = (search: string, replace: string): string =>
  ['<<<<<<< SEARCH', search, '=======', replace, '>>>>>>> REPLACE'].join('\n');

describe('resolveGeneration', () => {
  describe('正常系', () => {
    it('tsx 全文の応答は kind=full でそのまま解決する', () => {
      // Arrange
      const raw = ['```tsx', BASE, '```', META].join('\n');
      // Act
      const result = resolveGeneration(raw, null);
      // Assert
      expect(result.kind).toBe('full');
      expect(result.code).toBe(BASE);
      expect(result.meta?.title).toBe('t');
      expect(result.isComplete).toBe(true);
      expect(result.editError).toBeNull();
    });

    it('edits の応答は土台へ適用した完全なコードを返す', () => {
      const raw = [
        editsFence(editBlock('      <p>こんにちは</p>', '      <p>やあ</p>')),
        META,
      ].join('\n');
      const result = resolveGeneration(raw, BASE);
      expect(result.kind).toBe('edits');
      expect(result.code).toContain('<p>やあ</p>');
      expect(result.code).not.toContain('こんにちは');
      expect(result.isComplete).toBe(true);
      expect(result.editError).toBeNull();
      expect(result.appliedEdits).toBe(1);
    });
  });

  describe('異常系', () => {
    it('SEARCH が一致しないブロックがあると editError にブロック番号を含める', () => {
      const raw = [editsFence(editBlock('存在しないコード', 'x')), META].join(
        '\n',
      );
      const result = resolveGeneration(raw, BASE);
      expect(result.kind).toBe('edits');
      expect(result.editError).toContain('1');
      expect(result.appliedEdits).toBe(0);
      // 適用失敗でも土台は壊さない。
      expect(result.code).toBe(BASE);
    });

    it('土台が無いのに edits が来たら editError になる', () => {
      const raw = [editsFence(editBlock('a', 'b')), META].join('\n');
      const result = resolveGeneration(raw, null);
      expect(result.kind).toBe('edits');
      expect(result.editError).not.toBeNull();
      expect(result.code).toBeNull();
    });

    it('ブロックが1つも無いまま完了したら editError になる', () => {
      const raw = [editsFence(''), META].join('\n');
      const result = resolveGeneration(raw, BASE);
      expect(result.editError).not.toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('ストリーミング途中の edits は完成ブロックだけ適用し isComplete=false', () => {
      const raw = [
        '```edits',
        editBlock('      <p>こんにちは</p>', '      <p>やあ</p>'),
        '<<<<<<< SEARCH',
        '書きかけ',
      ].join('\n');
      const result = resolveGeneration(raw, BASE);
      expect(result.kind).toBe('edits');
      expect(result.code).toContain('<p>やあ</p>');
      expect(result.isComplete).toBe(false);
      expect(result.editError).toBeNull();
      expect(result.appliedEdits).toBe(1);
    });

    it('コード未到達のテキストは kind=null', () => {
      const result = resolveGeneration('考え中の前置き', BASE);
      expect(result.kind).toBeNull();
      expect(result.code).toBeNull();
    });

    it('応答を1文字ずつ伸ばしても例外なく解決でき、適用数が単調に増える', () => {
      const raw = [
        editsFence(
          [
            editBlock('      <p>こんにちは</p>', '      <p>やあ</p>'),
            editBlock(
              '    <div className="p-8">',
              '    <div className="p-10">',
            ),
          ].join('\n'),
        ),
        META,
      ].join('\n');
      let prevApplied = 0;
      for (let length = 1; length <= raw.length; length += 1) {
        const result = resolveGeneration(raw.slice(0, length), BASE);
        expect(result.appliedEdits).toBeGreaterThanOrEqual(prevApplied);
        prevApplied = result.appliedEdits;
      }
      expect(prevApplied).toBe(2);
    });
  });
});
