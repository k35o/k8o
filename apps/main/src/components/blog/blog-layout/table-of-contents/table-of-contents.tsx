'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { createPortal } from 'react-dom';

import { DockMenu } from '@/components/site/global-layout/dock/dock-menu';
import { useDockSlot } from '@/components/site/global-layout/dock/dock-slot';
import type { HeadingTree } from '@/features/blog/interface/queries';

import { END_OF_CONTENT_ID } from '../constants';
import { ProgressBar } from './progress-bar';
import { TocItem } from './toc-item';
import type { TocNode } from './toc-item';
import { useActiveHeading } from './use-active-heading';

import styles from './table-of-contents.module.css';

const hasHeading = (nodes: readonly TocNode[], id: string): boolean =>
  nodes.some(
    (node) =>
      node.text === id ||
      (node.children !== undefined && hasHeading(node.children, id)),
  );

export const TableOfContents: FC<{
  headingTree: HeadingTree;
}> = ({ headingTree }) => {
  const [activeId, setActiveId] = useActiveHeading();
  const [isOpen, setIsOpen] = useState(false);
  const slot = useDockSlot();

  if (headingTree.children.length === 0 || slot === null) return null;

  // 記事間の遷移直後は共有ストアに前の記事の見出しが残ることがあるため、
  // 今の記事の目次に無いidは現在地として扱わない
  const pinnedLabel =
    activeId === END_OF_CONTENT_ID
      ? 'さいごまで よみました'
      : hasHeading(headingTree.children, activeId)
        ? activeId
        : 'もくじ';

  return createPortal(
    <div className={styles.root}>
      <DockMenu
        icon={
          <ProgressBar
            activeId={activeId}
            headingTree={headingTree}
            size="sm"
          />
        }
        isOpen={isOpen}
        label="もくじ"
        onChange={setIsOpen}
        pinnedLabel={pinnedLabel}
      >
        <nav aria-label="もくじ">
          <ul className={styles.list}>
            {headingTree.children.map((node) => (
              <TocItem
                activeId={activeId}
                depth={1}
                key={node.text}
                linkClassName={styles.link}
                node={node}
                onNavigate={(id) => {
                  setActiveId(id);
                  setIsOpen(false);
                }}
              />
            ))}
          </ul>
        </nav>
      </DockMenu>
    </div>,
    slot,
  );
};
