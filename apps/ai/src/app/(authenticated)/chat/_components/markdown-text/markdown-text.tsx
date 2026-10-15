'use client';

import { Anchor, Code } from '@k8ordo/ui';
import { createContext, use } from 'react';
import type { FC } from 'react';
import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import styles from './markdown-text.module.css';

// react-markdown の code はインラインかコードブロックの中かを区別できないので、pre から伝える
const InCodeBlockContext = createContext(false);

const components: Components = {
  h1: ({ children }) => <h1 className={styles.heading}>{children}</h1>,
  h2: ({ children }) => <h2 className={styles.heading}>{children}</h2>,
  h3: ({ children }) => <h3 className={styles.heading}>{children}</h3>,
  h4: ({ children }) => <h4 className={styles.heading}>{children}</h4>,
  h5: ({ children }) => <h5 className={styles.heading}>{children}</h5>,
  h6: ({ children }) => <h6 className={styles.heading}>{children}</h6>,
  a: ({ href, children }) =>
    href === undefined || href === '' ? (
      <span>{children}</span>
    ) : (
      <Anchor href={href}>{children}</Anchor>
    ),
  ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
  ol: ({ children }) => <ol className={styles.orderedList}>{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className={styles.blockquote}>{children}</blockquote>
  ),
  strong: ({ children }) => (
    <strong className={styles.strong}>{children}</strong>
  ),
  em: ({ children }) => <em className={styles.em}>{children}</em>,
  hr: () => <hr className={styles.hr} />,
  table: ({ children }) => (
    <div
      className={styles.tableScroller}
      // 横にスクロールする広い表をキーボードでも読めるよう、フォーカスできるようにする
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    >
      <table className={styles.table}>{children}</table>
    </div>
  ),
  th: ({ children }) => <th className={styles.th}>{children}</th>,
  td: ({ children }) => <td className={styles.td}>{children}</td>,
  pre: ({ children }) => (
    <pre
      className={styles.pre}
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
const REMARK_PLUGINS = [remarkGfm];

export const MarkdownText: FC<{ children: string }> = ({ children }) => (
  // Message.Content の pre-wrap を受け継ぐと、ブロックの間の改行が空行として出るので戻す
  <div className={styles.root}>
    <Markdown
      components={components}
      disallowedElements={DISALLOWED_ELEMENTS}
      remarkPlugins={REMARK_PLUGINS}
    >
      {children}
    </Markdown>
  </div>
);
