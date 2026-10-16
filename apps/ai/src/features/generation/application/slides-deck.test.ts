import { describe, expect, it } from 'vitest';

import { settleSlidesDeck, slidesUserPrompt } from './slides-deck';

const DECK = [
  '<Cover>',
  '# 発表',
  '</Cover>',
  '',
  '---',
  '',
  '## まとめ',
  '',
  '- 振り返り',
].join('\n');

const META =
  '{"title": "発表", "description": "5枚のスライドにしました。", "changes": []}';

const output = (deck: string, fence = '````'): string =>
  [`${fence}md`, deck, fence, '', '```json', META, '```'].join('\n');

describe('slidesUserPrompt', () => {
  describe('正常系', () => {
    it('新しく作るときは、指示をそのまま user の文にする', () => {
      expect(
        slidesUserPrompt({ instruction: '5枚のスライドにする', base: null }),
      ).toBe('5枚のスライドにする');
    });

    it('直すときは、土台のデッキの節のあとに指示を置く', () => {
      expect(
        slidesUserPrompt({ instruction: '表紙の日付を消す', base: DECK }),
      ).toBe(
        [
          '# 現在のデッキ（これを土台に、ユーザー指示へ従って全文を再生成する。差分ではなく完全な置き換え）',
          '````md',
          DECK,
          '````',
          '',
          '# 指示',
          '表紙の日付を消す',
        ].join('\n'),
      );
    });
  });
});

describe('settleSlidesDeck', () => {
  describe('正常系', () => {
    it('デッキが閉じて1枚以上あれば、デッキと meta の説明を要約にして受け取る', () => {
      expect(
        settleSlidesDeck({ text: output(DECK), base: null }),
      ).toStrictEqual({
        type: 'ready',
        source: DECK,
        summary: '5枚のスライドにしました。',
      });
    });

    it('直すときは、土台と違うデッキを受け取る', () => {
      expect(
        settleSlidesDeck({ text: output(DECK), base: '## 前の1枚目' }),
      ).toStrictEqual({
        type: 'ready',
        source: DECK,
        summary: '5枚のスライドにしました。',
      });
    });

    it('meta が無くても、要約を空にして受け取る', () => {
      expect(
        settleSlidesDeck({
          text: ['````md', DECK, '````'].join('\n'),
          base: null,
        }),
      ).toStrictEqual({ type: 'ready', source: DECK, summary: '' });
    });
  });

  describe('異常系', () => {
    it('デッキを書かずに文章だけで答えたら、その文章を要約にして変わらなかったことにする', () => {
      expect(
        settleSlidesDeck({
          text: '\nどの記事のスライドか教えてください。\n',
          base: null,
        }),
      ).toStrictEqual({
        type: 'no-change',
        summary: 'どの記事のスライドか教えてください。',
      });
    });

    it('デッキを書かずに meta だけを出したら、meta の説明を要約にして変わらなかったことにする', () => {
      expect(
        settleSlidesDeck({
          text: ['```json', META, '```'].join('\n'),
          base: null,
        }),
      ).toStrictEqual({
        type: 'no-change',
        summary: '5枚のスライドにしました。',
      });
    });

    it('土台と同じデッキなら、meta の説明を要約にして変わらなかったことにする', () => {
      expect(
        settleSlidesDeck({ text: output(DECK), base: DECK }),
      ).toStrictEqual({
        type: 'no-change',
        summary: '5枚のスライドにしました。',
      });
    });

    it('デッキを囲むフェンスが閉じていなければ、読み取れなかったことにする', () => {
      expect(
        settleSlidesDeck({ text: ['````md', DECK].join('\n'), base: null }),
      ).toStrictEqual({
        type: 'failed',
        reason:
          'デッキを囲むフェンスが閉じていないか、中のコードブロックで切れています',
      });
    });

    it.each([
      ['言語つき', '```ts'],
      ['言語の無い', '```'],
    ])(
      '外側が3つで、中の%sコードブロックのフェンスでデッキが切れたら、読み取れなかったことにする',
      (_label, codeOpen) => {
        const deck = [
          DECK,
          '',
          '---',
          '',
          '## 入れ方',
          codeOpen,
          'npm i',
          '```',
        ].join('\n');

        expect(
          settleSlidesDeck({ text: output(deck, '```'), base: null }),
        ).toStrictEqual({
          type: 'failed',
          reason:
            'デッキを囲むフェンスが閉じていないか、中のコードブロックで切れています',
        });
      },
    );

    it('外側は閉じたのに中のコードブロックが閉じていなければ、読み取れなかったことにする', () => {
      const deck = [DECK, '', '---', '', '## 入れ方', '```sh', 'npm i'].join(
        '\n',
      );

      expect(
        settleSlidesDeck({ text: output(deck), base: null }),
      ).toStrictEqual({
        type: 'failed',
        reason: 'デッキの中のコードブロックが閉じていません',
      });
    });

    it('デッキが閉じたのに1枚も無ければ、読み取れなかったことにする', () => {
      expect(
        settleSlidesDeck({ text: output('---'), base: null }),
      ).toStrictEqual({ type: 'failed', reason: 'スライドが1枚もありません' });
    });
  });

  describe('エッジケース', () => {
    it('外側が3つでも、中にコードブロックが無ければ受け取る', () => {
      expect(
        settleSlidesDeck({ text: output(DECK, '```'), base: null }),
      ).toStrictEqual({
        type: 'ready',
        source: DECK,
        summary: '5枚のスライドにしました。',
      });
    });

    it('meta が無く、土台と同じデッキなら、要約を空にして変わらなかったことにする', () => {
      expect(
        settleSlidesDeck({
          text: ['````md', DECK, '````'].join('\n'),
          base: DECK,
        }),
      ).toStrictEqual({ type: 'no-change', summary: '' });
    });
  });
});
