'use client';

import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { createContext, Fragment, useContext } from 'react';
import type { FC } from 'react';
import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';

import type { DeckSlide } from '@/features/slides/application/parse-deck';

import { Cover, CoverSubtitle, CoverText, CoverTitle } from '../cover';
import {
  Blockquote,
  H1,
  H2,
  H3,
  H4,
  Li,
  Ol,
  P,
  Pre,
  Strong,
  Ul,
} from '../md-parts';

// デッキ全体のコードブロックのハイライト結果（キー → トークン列）。DeckPreview が
// デッキ確定時に一括取得して配る。未取得・失敗・Storybook ではプレーン表示になる。
export const DeckHighlightsContext = createContext<
  ReadonlyMap<string, HighlightedCode>
>(new Map());

export const highlightKey = (lang: string, code: string): string =>
  `${lang}\u0000${code}`;

const textOf = (children: unknown): string | null => {
  if (!Array.isArray(children)) {
    return null;
  }
  let out = '';
  for (const child of children) {
    if (typeof child !== 'object' || child === null) {
      return null;
    }
    const record = child as Record<string, unknown>;
    if (record['type'] !== 'text' || typeof record['value'] !== 'string') {
      return null;
    }
    out += record['value'];
  }
  return out;
};

// hast の <pre><code class="language-x">…</code></pre> からコード文字列と言語を取り出す。
// 想定外の形なら null（呼び出し側がプレーン描画にフォールバックする）。
const extractCodeBlock = (
  node: unknown,
): { code: string; lang: string } | null => {
  if (typeof node !== 'object' || node === null) {
    return null;
  }
  const { children } = node as Record<string, unknown>;
  if (!Array.isArray(children) || children.length !== 1) {
    return null;
  }
  const codeEl = children[0] as Record<string, unknown>;
  if (typeof codeEl !== 'object' || codeEl['tagName'] !== 'code') {
    return null;
  }
  let lang = 'text';
  const { properties } = codeEl;
  if (typeof properties === 'object' && properties !== null) {
    const { className } = properties as Record<string, unknown>;
    if (Array.isArray(className)) {
      for (const name of className) {
        if (typeof name === 'string' && name.startsWith('language-')) {
          lang = name.slice('language-'.length);
          break;
        }
      }
    }
  }
  const code = textOf(codeEl['children']);
  if (code === null) {
    return null;
  }
  return { code: code.replace(/\n$/u, ''), lang };
};

// ハイライト済みのコードブロック。ブログ/main のスライドと同じ暗色サーフェスで描画する。
const HighlightedPre: FC<{ highlighted: HighlightedCode }> = ({
  highlighted,
}) => (
  <Pre style={{ backgroundColor: highlighted.bg, color: highlighted.fg }}>
    <code>
      {highlighted.tokens.map((line, lineIndex) => (
        <Fragment key={`line-${lineIndex.toString()}`}>
          {line.map((token, tokenIndex) => (
            <span
              key={`${lineIndex.toString()}-${tokenIndex.toString()}`}
              style={{ color: token.color ?? highlighted.fg }}
            >
              {token.content}
            </span>
          ))}
          {lineIndex < highlighted.tokens.length - 1 ? '\n' : null}
        </Fragment>
      ))}
    </code>
  </Pre>
);

// AI が生成した Markdown をスライドの見た目に割り当てる。生 HTML は react-markdown が
// 既定で描画しない（Cover / Notes は parse-deck が事前に取り除いている）。
const components: Components = {
  h1: ({ children }) => <H1>{children}</H1>,
  h2: ({ children }) => <H2>{children}</H2>,
  h3: ({ children }) => <H3>{children}</H3>,
  h4: ({ children }) => <H4>{children}</H4>,
  p: ({ children }) => <P>{children}</P>,
  ul: ({ children }) => <Ul>{children}</Ul>,
  ol: ({ children }) => <Ol>{children}</Ol>,
  li: ({ children }) => <Li>{children}</Li>,
  strong: ({ children }) => <Strong>{children}</Strong>,
  pre: function PreBlock({ node, children }) {
    // フックを使うため名前付き関数コンポーネントにしている。
    const highlights = useContext(DeckHighlightsContext);
    const block = extractCodeBlock(node);
    const highlighted =
      block === null
        ? undefined
        : highlights.get(highlightKey(block.lang, block.code));
    return highlighted === undefined ? (
      <Pre>{children}</Pre>
    ) : (
      <HighlightedPre highlighted={highlighted} />
    );
  },
  blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
};

// 表紙は見出しと本文を表紙用の部品に差し替える。
const coverComponents: Components = {
  ...components,
  h1: ({ children }) => <CoverTitle>{children}</CoverTitle>,
  h2: ({ children }) => <CoverSubtitle>{children}</CoverSubtitle>,
  p: ({ children }) => <CoverText>{children}</CoverText>,
};

// system で禁じている画像をモデルが書いても、外の URL は CSP で読み込めず、壊れた画像の枠が
// 出るので描かない
const DISALLOWED_ELEMENTS = ['img'];

// 1枚ぶんのスライド本文。Stage の content（cqi コンテキスト）の中に置いて使う。
export const DeckSlideView: FC<{ slide: DeckSlide }> = ({ slide }) =>
  slide.isCover ? (
    <Cover>
      <Markdown
        components={coverComponents}
        disallowedElements={DISALLOWED_ELEMENTS}
      >
        {slide.source}
      </Markdown>
    </Cover>
  ) : (
    <Markdown components={components} disallowedElements={DISALLOWED_ELEMENTS}>
      {slide.source}
    </Markdown>
  );
