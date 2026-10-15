'use client';

import Link from 'next/link';
import type { FC } from 'react';

import type { HeadingTree } from '@/shared/mdx/types';

import { END_OF_CONTENT_ID } from '../constants';
import { ProgressBar } from './progress-bar';
import { useActiveHeading } from './use-active-heading';

import styles from './table-of-contents.module.css';

const LinkButton: FC<{
  depth: number;
  text: string;
  isActive: boolean;
  onNavigate: (id: string) => void;
}> = ({ depth, text, isActive, onNavigate }) => (
  <Link
    aria-current={isActive ? 'location' : undefined}
    className={styles.link}
    data-depth={depth}
    href={`#${text}`}
    onClick={() => {
      onNavigate(text);
    }}
  >
    {text}
  </Link>
);

// 開いた目次の外を押したら閉じる。要素に結び付く購読なので、cleanup を返す
// ref callback で持ち、effect を使わない
const closeOnPointerDownOutside = (
  details: HTMLDetailsElement | null,
): (() => void) | undefined => {
  if (details === null) return undefined;
  const handler = (event: PointerEvent): void => {
    if (event.target instanceof Node && !details.contains(event.target)) {
      details.open = false;
    }
  };
  document.addEventListener('pointerdown', handler);
  return () => {
    document.removeEventListener('pointerdown', handler);
  };
};

type TocNode = {
  text: string;
  children?: readonly TocNode[];
};

const hasHeading = (nodes: readonly TocNode[], id: string): boolean =>
  nodes.some(
    (node) =>
      node.text === id ||
      (node.children !== undefined && hasHeading(node.children, id)),
  );

const TocItem: FC<{
  node: TocNode;
  depth: number;
  activeId: string;
  onNavigate: (id: string) => void;
}> = ({ node, depth, activeId, onNavigate }) => (
  <li>
    <LinkButton
      depth={depth}
      isActive={activeId === node.text}
      onNavigate={onNavigate}
      text={node.text}
    />
    {node.children && node.children.length > 0 && (
      <ul>
        {node.children.map((child) => (
          <TocItem
            activeId={activeId}
            depth={depth + 1}
            key={child.text}
            node={child}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    )}
  </li>
);

export const TableOfContents: FC<{
  headingTree: HeadingTree;
}> = ({ headingTree }) => {
  const [activeId, setActiveId] = useActiveHeading();

  if (headingTree.children.length === 0) return null;

  // 記事間の遷移直後は共有ストアに前の記事の見出しが残ることがあるため、
  // 今の記事の目次に無いidは現在地として扱わない
  const isKnownId =
    activeId === END_OF_CONTENT_ID ||
    hasHeading(headingTree.children, activeId);
  const summaryText =
    activeId === '' || !isKnownId
      ? 'もくじ'
      : activeId === END_OF_CONTENT_ID
        ? 'さいごまで よみました'
        : activeId;

  return (
    <details className={styles.root} ref={closeOnPointerDownOutside}>
      <summary className={styles.summary}>
        <ProgressBar activeId={activeId} headingTree={headingTree} />
        <span className={styles.summaryText}>{summaryText}</span>
      </summary>
      <nav aria-label="もくじ">
        <ul className={styles.list}>
          {headingTree.children.map((node) => (
            <TocItem
              activeId={activeId}
              depth={1}
              key={node.text}
              node={node}
              onNavigate={setActiveId}
            />
          ))}
        </ul>
      </nav>
    </details>
  );
};
