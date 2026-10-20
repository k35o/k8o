import {
  hasUnclosedCodeFence,
  parseDeck,
} from '@/features/slides/application/parse-deck';

import { parseSlidesGeneration } from './parse-slides-generation';

type SlidesDeckSettlement =
  | { type: 'ready'; source: string; summary: string }
  | { type: 'no-change'; summary: string }
  | { type: 'failed'; reason: string };

export const slidesUserPrompt = (input: {
  instruction: string;
  base: string | null;
}): string =>
  input.base === null
    ? input.instruction
    : [
        '# 現在のデッキ（これを土台に、ユーザー指示へ従って全文を再生成する。差分ではなく完全な置き換え）',
        '````md',
        input.base,
        '````',
        '',
        '# 指示',
        input.instruction,
      ].join('\n');

export const settleSlidesDeck = (input: {
  text: string;
  base: string | null;
}): SlidesDeckSettlement => {
  const { source, meta, isSourceComplete } = parseSlidesGeneration(input.text);
  if (source === null) {
    return {
      type: 'no-change',
      summary: meta?.description ?? input.text.trim(),
    };
  }
  if (!isSourceComplete) {
    return {
      type: 'failed',
      reason:
        'デッキを囲むフェンスが閉じていないか、中のコードブロックで切れています',
    };
  }
  if (hasUnclosedCodeFence(source)) {
    return {
      type: 'failed',
      reason: 'デッキの中のコードブロックが閉じていません',
    };
  }
  if (parseDeck(source).length === 0) {
    return { type: 'failed', reason: 'スライドが1枚もありません' };
  }
  const summary = meta?.description ?? '';
  if (source === input.base) {
    return { type: 'no-change', summary };
  }
  return { type: 'ready', source, summary };
};
