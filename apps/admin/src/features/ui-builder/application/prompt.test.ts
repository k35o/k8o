import { buildSystemPrompt } from './prompt';

describe('buildSystemPrompt', () => {
  describe('正常系', () => {
    it('空でないシステムプロンプトを生成する', () => {
      const prompt = buildSystemPrompt();

      expect(prompt.length).toBeGreaterThan(0);
    });

    it('利用可能な arte-odyssey コンポーネント名を含む', () => {
      const prompt = buildSystemPrompt();

      expect(prompt).toContain('Stack');
      expect(prompt).toContain('Button');
    });

    it('チャット向けの追加ルール（地の文を添える指示）を含む', () => {
      const prompt = buildSystemPrompt();

      expect(prompt).toContain('地の文');
    });

    it('arteOdysseyRules（Table のセル数を columns に揃える等）を含む', () => {
      const prompt = buildSystemPrompt();

      expect(prompt).toContain('columns');
    });
  });
});
