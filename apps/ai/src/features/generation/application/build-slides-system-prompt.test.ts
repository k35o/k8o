import { describe, expect, it } from 'vitest';

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
  });
});
