import { describe, expect, it } from 'vitest';

import { parseSlidesGeneration } from './parse-slides-generation';

const DECK = [
  '<Cover>',
  '# タイトル',
  '</Cover>',
  '',
  '---',
  '',
  '## 1枚目',
].join('\n');

describe('parseSlidesGeneration', () => {
  describe('正常系', () => {
    it('md と json の両フェンスから source と meta を抽出できる', () => {
      const raw = [
        '````md',
        DECK,
        '````',
        '```json',
        '{"title": "デッキ", "description": "新規作成", "changes": ["表紙を追加"]}',
        '```',
      ].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe(DECK);
      expect(result.meta?.title).toBe('デッキ');
      expect(result.meta?.changes).toStrictEqual(['表紙を追加']);
      expect(result.isSourceComplete).toBe(true);
    });

    it('デッキが閉じれば、meta が無くても閉じたものとして扱う', () => {
      const raw = ['````md', DECK, '````'].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe(DECK);
      expect(result.meta).toBeNull();
      expect(result.isSourceComplete).toBe(true);
    });

    it('デッキのあとにフェンスの行の無い文が続いても、閉じたものとして扱う', () => {
      const raw = ['````md', DECK, '````', '', '以上です。'].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe(DECK);
      expect(result.isSourceComplete).toBe(true);
    });

    it('外側が3つのバッククォートでも、中にコードブロックが無ければ閉じたものとして扱う', () => {
      const raw = [
        '```md',
        DECK,
        '```',
        '```json',
        '{"title": "デッキ", "description": "新規作成", "changes": []}',
        '```',
      ].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe(DECK);
      expect(result.meta?.title).toBe('デッキ');
      expect(result.isSourceComplete).toBe(true);
    });

    it('デッキ内の ``` コードブロックがあっても外側フェンスの終わりまで source に含める', () => {
      const deck = ['## コード', '```ts', 'const a = 1;', '```', '本文'].join(
        '\n',
      );
      const raw = ['````md', deck, '````'].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe(deck);
    });

    it('デッキ内に ```json コードブロックがあっても meta と誤認しない', () => {
      const deck = ['## 設定', '```json', '{"title": "偽物"}', '```'].join(
        '\n',
      );
      const raw = [
        '````md',
        deck,
        '````',
        '```json',
        '{"title": "本物", "description": "", "changes": []}',
        '```',
      ].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.meta?.title).toBe('本物');
    });

    it('json フェンスだけのテキスト（会話復元用）からも meta を取れる', () => {
      const raw = ['```json', '{"title": "t", "description": "d"}', '```'].join(
        '\n',
      );
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBeNull();
      expect(result.meta?.description).toBe('d');
      expect(result.isSourceComplete).toBe(false);
    });
  });

  describe('異常系', () => {
    it('閉じフェンス未到達（ストリーミング途中）は途中までを source として返す', () => {
      const raw = ['````md', '<Cover>', '# タイ'].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe('<Cover>\n# タイ');
      expect(result.isSourceComplete).toBe(false);
    });

    it('ストリーミング途中の書きかけ閉じフェンスは本文に混ぜない', () => {
      const raw = ['````md', '## 1枚目', '``'].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe('## 1枚目');
    });

    it('壊れた meta JSON は null にし、デッキは閉じたものとして扱う', () => {
      const raw = [
        '````md',
        '## 1枚目',
        '````',
        '```json',
        '{oops',
        '```',
      ].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe('## 1枚目');
      expect(result.meta).toBeNull();
      expect(result.isSourceComplete).toBe(true);
    });

    it('外側が3つで、中の言語つきのコードブロックの閉じでデッキが切れたら、閉じていないものとして扱う', () => {
      const raw = [
        '```md',
        '## コード',
        '',
        '```ts',
        'const a = 1;',
        '```',
        '',
        '---',
        '',
        '## まとめ',
        '```',
        '',
        '```json',
        '{"title": "デッキ", "description": "新規作成", "changes": []}',
        '```',
      ].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe('## コード\n\n```ts\nconst a = 1;');
      expect(result.meta?.title).toBe('デッキ');
      expect(result.isSourceComplete).toBe(false);
    });

    it('外側が3つで、中の言語の無いコードブロックの開きでデッキが切れたら、閉じていないものとして扱う', () => {
      const raw = [
        '```md',
        '## 入れ方',
        '',
        '```',
        'npm i',
        '```',
        '',
        '---',
        '',
        '## まとめ',
        '```',
        '',
        '```json',
        '{"title": "デッキ", "description": "新規作成", "changes": []}',
        '```',
      ].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe('## 入れ方');
      expect(result.meta?.title).toBe('デッキ');
      expect(result.isSourceComplete).toBe(false);
    });

    it('外側が3つで切れたあと、デッキの中の ```json のコードブロックより前にフェンスだけの行が残れば、閉じていないものとして扱う', () => {
      const raw = [
        '```md',
        '## 入れ方',
        '```',
        'npm i',
        '```',
        '---',
        '## 設定',
        '```json',
        '{"a": 1}',
        '```',
        '```',
        '```json',
        '{"title": "デッキ", "description": "新規作成", "changes": []}',
        '```',
      ].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe('## 入れ方');
      expect(result.isSourceComplete).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('フェンスが無いテキストは source も meta も null', () => {
      const result = parseSlidesGeneration('こんにちは');
      expect(result).toStrictEqual({
        source: null,
        meta: null,
        isSourceComplete: false,
      });
    });

    it('開きフェンス直後で入力が終わっていても落ちない', () => {
      const result = parseSlidesGeneration('````md');
      expect(result.source).toBeNull();
      expect(result.isSourceComplete).toBe(false);
    });

    it('```md（3つ）で始まるフェンスも受け付ける', () => {
      const raw = ['```md', '## 1枚目', '```'].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.source).toBe('## 1枚目');
      expect(result.isSourceComplete).toBe(true);
    });

    it('meta をバッククォート4つのフェンスで書いても、閉じたものとして扱う', () => {
      const raw = [
        '````md',
        DECK,
        '````',
        '',
        '````json',
        '{"title": "デッキ", "description": "新規作成", "changes": []}',
        '````',
      ].join('\n');
      const result = parseSlidesGeneration(raw);
      expect(result.meta?.title).toBe('デッキ');
      expect(result.isSourceComplete).toBe(true);
    });
  });
});
