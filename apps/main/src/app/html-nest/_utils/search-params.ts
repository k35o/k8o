import { createParser } from 'nuqs/server';

import { HTML_ELEMENT_TAGS } from '../_data/elements';

// 初期表示する要素。flow / phrasing どちらにも関わり、親子の例が豊富な div を既定にする。
export const DEFAULT_TAG = 'div';

const TAG_SET = new Set(HTML_ELEMENT_TAGS);

const parseTag = (query: string): string | null =>
  TAG_SET.has(query) ? query : null;

// 選択中の要素を URL `?el=` に同期するためのパーサ。
// データセットに存在しないタグは無視して既定値にフォールバックする。
export const htmlNestParsers = {
  selected: createParser({
    parse: parseTag,
    serialize: (value: string): string => value,
    eq: (a: string, b: string): boolean => a === b,
  }).withDefault(DEFAULT_TAG),
};

export const htmlNestUrlKeys = {
  selected: 'el',
} as const;
