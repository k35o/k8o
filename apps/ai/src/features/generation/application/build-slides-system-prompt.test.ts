import { buildSlidesSystemPrompt } from './build-slides-system-prompt';

describe('buildSlidesSystemPrompt', () => {
  describe('正常系', () => {
    it('基本プロンプトにデッキ書式と出力フォーマットを含む', () => {
      const prompt = buildSlidesSystemPrompt();
      expect(prompt).toContain('<Cover>');
      expect(prompt).toContain('<Notes>');
      expect(prompt).toContain('---');
      expect(prompt).toContain('````md');
      expect(prompt).toContain('```json');
    });

    it('currentSource を渡すと再生成セクションと本文を含む', () => {
      const prompt = buildSlidesSystemPrompt({
        currentSource: '## 既存の1枚目',
      });
      expect(prompt).toContain('全文を再生成');
      expect(prompt).toContain('## 既存の1枚目');
    });
  });

  describe('エッジケース', () => {
    it('空白だけの currentSource のときは再生成セクションを含まない', () => {
      const prompt = buildSlidesSystemPrompt({ currentSource: '   ' });
      expect(prompt).not.toContain('全文を再生成');
    });
  });
});
