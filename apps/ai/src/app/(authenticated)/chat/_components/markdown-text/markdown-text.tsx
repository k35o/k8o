'use client';

import { Anchor, Code } from '@k8ordo/ui';
import { createContext, use } from 'react';
import type { FC } from 'react';
import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';

// react-markdown の code はインラインかコードブロックの中かを区別できないので、pre から伝える
const InCodeBlockContext = createContext(false);

const components: Components = {
  h1: ({ children }) => <h1 className="text-base font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-bold">{children}</h3>,
  h4: ({ children }) => <h4 className="text-base font-bold">{children}</h4>,
  h5: ({ children }) => <h5 className="text-base font-bold">{children}</h5>,
  h6: ({ children }) => <h6 className="text-base font-bold">{children}</h6>,
  a: ({ href, children }) =>
    href === undefined || href === '' ? (
      <span>{children}</span>
    ) : (
      <Anchor href={href}>{children}</Anchor>
    ),
  ul: ({ children }) => (
    <ul className="flex list-disc flex-col gap-1 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="flex list-decimal flex-col gap-1 pl-6">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-border-base text-fg-mute flex flex-col gap-3 border-l-4 pl-4">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="border-border-mute" />,
  pre: ({ children }) => (
    <pre
      className="bg-bg-mute text-fg-base overflow-x-auto rounded-lg p-3 text-sm"
      // 横にスクロールする長い行をキーボードでも読めるよう、フォーカスできるようにする
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    >
      <InCodeBlockContext value>{children}</InCodeBlockContext>
    </pre>
  ),
  code: function MarkdownCode({ children }) {
    const inCodeBlock = use(InCodeBlockContext);
    return !inCodeBlock && typeof children === 'string' ? (
      <Code>{children}</Code>
    ) : (
      <code>{children}</code>
    );
  },
};

// 画像を読み込むと、モデルが書いた URL へ外から通信させられるので描かない
const DISALLOWED_ELEMENTS = ['img'];

export const MarkdownText: FC<{ children: string }> = ({ children }) => (
  // Message.Content の pre-wrap を受け継ぐと、ブロックの間の改行が空行として出るので戻す
  <div className="flex flex-col gap-3 whitespace-normal">
    <Markdown components={components} disallowedElements={DISALLOWED_ELEMENTS}>
      {children}
    </Markdown>
  </div>
);
