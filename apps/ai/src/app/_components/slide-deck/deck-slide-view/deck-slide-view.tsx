import type { FC } from 'react';
import Markdown, { type Components } from 'react-markdown';

import type { DeckSlide } from '@/features/slides/application/parse-deck';

import { Cover } from '../cover';
import {
  Blockquote,
  H1,
  H2,
  H3,
  H4,
  LI,
  OL,
  P,
  Pre,
  Strong,
  UL,
} from '../md-parts';

// AI が生成した Markdown をスライドの見た目に割り当てる。生 HTML は react-markdown が
// 既定で描画しない（Cover / Notes は parse-deck が事前に取り除いている）。
const components: Components = {
  h1: ({ children }) => <H1>{children}</H1>,
  h2: ({ children }) => <H2>{children}</H2>,
  h3: ({ children }) => <H3>{children}</H3>,
  h4: ({ children }) => <H4>{children}</H4>,
  p: ({ children }) => <P>{children}</P>,
  ul: ({ children }) => <UL>{children}</UL>,
  ol: ({ children }) => <OL>{children}</OL>,
  li: ({ children }) => <LI>{children}</LI>,
  strong: ({ children }) => <Strong>{children}</Strong>,
  pre: ({ children }) => <Pre>{children}</Pre>,
  blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
};

// 1枚ぶんのスライド本文。Stage の content（cqi コンテキスト）の中に置いて使う。
export const DeckSlideView: FC<{ slide: DeckSlide }> = ({ slide }) => {
  const body = <Markdown components={components}>{slide.source}</Markdown>;
  return slide.isCover ? <Cover>{body}</Cover> : body;
};
