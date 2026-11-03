import type { MDXComponents } from 'mdx/types';

import { Blockquote } from '../mdx-parts/blockquote/blockquote';
import { H1, H2, H3, H4 } from '../mdx-parts/heading/heading';
import { LI, OL, UL } from '../mdx-parts/list/list';
import { P } from '../mdx-parts/paragraph/paragraph';
import { Pre } from '../mdx-parts/pre/pre';
import { Strong } from '../mdx-parts/strong/strong';
import { Cover } from '../slide-mdx/cover/cover';
import { Image } from '../slide-mdx/image/image';
import { Notes } from '../slide-mdx/notes/notes';
import { SlideDeckShell } from '../slide-mdx/slide-deck-shell/slide-deck-shell';

export const slideMdxComponents: MDXComponents = {
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
  Cover,
  Image,
  Notes,
  SlideDeckShell,
};
