import { definePageState } from '@k8ordo/state';
import * as z from 'zod/mini';

import { HTML_ELEMENT_TAGS } from '../elements/elements';

// 初期表示する要素。flow / phrasing どちらにも関わり、親子の例が豊富な div を既定にする。
const DEFAULT_TAG = 'div';

const TAG_SET = new Set(HTML_ELEMENT_TAGS);

// 選択中の要素を URL `?el=` に同期する。文字列のまま持ち、読むときに解く。z.refine を足すと、zod の本体が
// 入る frame-*.js が大きくなり、どのページも大きくなる
export const htmlNestState = definePageState('html-nest', {
  url: z.object({
    el: z._default(z.string(), DEFAULT_TAG),
  }),
});

// データセットに存在しないタグは無視して既定値にフォールバックする。
export const readNestUrl = (url: { el: string }): string =>
  TAG_SET.has(url.el) ? url.el : DEFAULT_TAG;
