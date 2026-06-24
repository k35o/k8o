import { buildSystemPrompt } from './build-system-prompt';

describe('buildSystemPrompt', () => {
  describe('正常系', () => {
    it('基本プロンプトに許可リスト・色トークン・出力フォーマットを含む', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Card');
      expect(prompt).toContain('text-fg-base');
      expect(prompt).toContain('bg-bg-surface');
      expect(prompt).toContain('export default function Preview()');
      expect(prompt).toContain('```tsx');
      expect(prompt).toContain('```json');
    });

    it('currentFile を渡すと再生成セクションと本文を含む', () => {
      const prompt = buildSystemPrompt({ currentFile: 'const X = 1;' });
      expect(prompt).toContain('全文を再生成');
      expect(prompt).toContain('const X = 1;');
    });

    it('buildErrors を渡すと self-heal セクションとエラー文を含む', () => {
      const prompt = buildSystemPrompt({ buildErrors: 'TypeError: boom' });
      expect(prompt).toContain('原因を修正した');
      expect(prompt).toContain('TypeError: boom');
    });
  });

  describe('エッジケース', () => {
    it('引数なし・空白だけのときは条件セクションを含まない', () => {
      const prompt = buildSystemPrompt({ currentFile: '   ', buildErrors: '' });
      expect(prompt).not.toContain('全文を再生成');
      expect(prompt).not.toContain('原因を修正した');
    });
  });
});
