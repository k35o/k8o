'use client';

import { useClickAway } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

import type { HeadingTree } from '@/shared/mdx/types';

import { END_OF_CONTENT_ID } from '../constants';
import { ProgressBar } from './progress-bar';

const LinkButton: FC<{
  depth: number;
  text: string;
  isActive: boolean;
  onNavigate: (id: string) => void;
}> = ({ depth, text, isActive, onNavigate }) => (
  <Link
    aria-current={isActive ? 'location' : undefined}
    className={cn(
      'inline-block w-full rounded-xl px-4 py-2 transition-colors hover:bg-bg-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-info focus-visible:ring-offset-2 sm:text-lg',
      depth === 2 && 'pl-8 text-sm sm:text-md',
      depth === 3 && 'pl-12 text-xs sm:text-sm',
      isActive && 'xl:bg-primary-bg xl:font-bold xl:text-fg-base',
    )}
    href={`#${text}`}
    onClick={() => {
      onNavigate(text);
    }}
  >
    {text}
  </Link>
);

type TocNode = {
  text: string;
  children?: readonly TocNode[];
};

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
  const [activeId, setActiveId] = useState('');

  const ref = useRef<HTMLDetailsElement>(null);
  useClickAway(ref, () => {
    if (ref.current) {
      ref.current.open = false;
    }
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting);
        if (intersecting.length === 0) return;
        const topEntry = intersecting.reduce((prev, current) =>
          prev.boundingClientRect.top < current.boundingClientRect.top
            ? prev
            : current,
        );
        setActiveId(topEntry.target.id);
      },
      { rootMargin: '-80px 0px -80% 0px' },
    );

    const headings = document.querySelectorAll('h2[id], h3[id], h4[id]');
    for (const heading of headings) observer.observe(heading);
    const eocElement = document.querySelector(`#${END_OF_CONTENT_ID}`);
    if (eocElement) observer.observe(eocElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (headingTree.children.length === 0) return null;

  const summaryText =
    activeId === ''
      ? 'もくじ'
      : activeId === END_OF_CONTENT_ID
        ? 'さいごまで よみました'
        : activeId;

  return (
    <details
      className={cn(
        'fixed w-80 rounded-xl bg-bg-raised shadow-md',
        'right-4 bottom-4 open:right-0 open:bottom-0 sm:right-16 sm:bottom-8 open:sm:right-16 open:sm:bottom-8',
        'open:details-content:border-border-mute open:details-content:border-t open:details-content:p-4 open:details-content:pt-0',
      )}
      ref={ref}
    >
      <summary className="text-md text-primary-fg flex items-center gap-2 p-4 font-bold sm:text-lg">
        <ProgressBar activeId={activeId} headingTree={headingTree} />
        <span className="truncate">{summaryText}</span>
      </summary>
      <nav aria-label="もくじ">
        <ul className="text-fg-base flex max-h-[75vh] flex-col overflow-y-scroll p-2">
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
