import { messageText, parseGeneration } from './parse-generation';

describe('parseGeneration', () => {
  describe('正常系', () => {
    it('tsx と json の両フェンスから code と meta を抽出できる', () => {
      // Arrange
      const raw = [
        '```tsx',
        'export default function Preview() { return <div>hi</div>; }',
        '```',
        '```json',
        '{"title":"t","description":"d","usedComponents":["Card"],"changes":["init"]}',
        '```',
      ].join('\n');
      // Act
      const result = parseGeneration(raw);
      // Assert
      expect(result.code).toContain('export default function Preview()');
      expect(result.meta).toEqual({
        title: 't',
        description: 'd',
        usedComponents: ['Card'],
        changes: ['init'],
      });
      expect(result.isComplete).toBe(true);
    });
  });

  describe('異常系', () => {
    it('json フェンスが壊れていると meta は null で isComplete=false', () => {
      const raw = '```tsx\nconst a = 1;\n```\n```json\n{壊れ\n```';
      const result = parseGeneration(raw);
      expect(result.code).toBe('const a = 1;');
      expect(result.meta).toBeNull();
      expect(result.isComplete).toBe(false);
    });

    it('code フェンスが無いと code は null', () => {
      const result = parseGeneration('ただの文章');
      expect(result.code).toBeNull();
      expect(result.isComplete).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('ストリーミング中の未完 tsx フェンスでも途中までを code に拾う', () => {
      const raw = '```tsx\nexport default function Preview() {';
      const result = parseGeneration(raw);
      expect(result.code).toContain('export default function Preview()');
      expect(result.isComplete).toBe(false);
    });

    it('空文字なら code/meta ともに null', () => {
      const result = parseGeneration('');
      expect(result.code).toBeNull();
      expect(result.meta).toBeNull();
    });
  });
});

describe('messageText', () => {
  describe('正常系', () => {
    it('text パートを連結して返す', () => {
      const text = messageText({
        id: '1',
        role: 'assistant',
        parts: [
          { type: 'text', text: 'あ' },
          { type: 'text', text: 'い' },
        ],
      } as unknown as Parameters<typeof messageText>[0]);
      expect(text).toBe('あい');
    });
  });

  describe('エッジケース', () => {
    it('text パートが無ければ空文字', () => {
      const text = messageText({
        id: '1',
        role: 'assistant',
        parts: [],
      } as unknown as Parameters<typeof messageText>[0]);
      expect(text).toBe('');
    });
  });
});
