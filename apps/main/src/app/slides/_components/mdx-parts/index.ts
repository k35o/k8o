import type { MDXComponents } from 'mdx/types';

import { Blockquote } from './blockquote';
import { H1, H2, H3, H4 } from './heading';
import { LI, OL, UL } from './list';
import { P } from './paragraph';
import { Pre } from './pre';
import { Strong } from './strong';

/**
 * MDX が h1/h2/p/ul... 等のタグを描画する際に当てるコンポーネントマップ。
 * page.tsx で `<Content components={slideMDXComponents} />` として渡す。
 * MDX writer が直接 import して使う想定ではない。
 */
export const slideMDXComponents: MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  strong: Strong,
  pre: Pre,
  blockquote: Blockquote,
};
