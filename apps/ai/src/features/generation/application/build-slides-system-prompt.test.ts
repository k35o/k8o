import { describe, expect, it } from 'vitest';

import {
  buildSlidesSystemPrompt,
  currentDeckSection,
} from './build-slides-system-prompt';

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

describe('currentDeckSection', () => {
  describe('正常系', () => {
    it('土台のデッキを ````md で囲み、全文を置き換えさせる見出しを付ける', () => {
      expect(currentDeckSection('## 既存の1枚目')).toBe(
        [
          '# 現在のデッキ（これを土台に、ユーザー指示へ従って全文を再生成する。差分ではなく完全な置き換え）',
          '````md',
          '## 既存の1枚目',
          '````',
        ].join('\n'),
      );
    });
  });
});
