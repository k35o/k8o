'use client';

import { useClickAway } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import type { HeadingTree } from '@repo/helpers/mdx/types';
import Link from 'next/link';
import { type FC, useCallback, useEffect, useState } from 'react';
import { END_OF_CONTENT_ID } from '../constants';
import { ProgressBar } from './progress-bar';

const LinkButton: FC<{
  depth: number;
  text: string;
  isActive: boolean;
  onNavigate: (id: string) => void;
}> = ({ depth, text, isActive, onNavigate }) => {
  return (
    <Link
      className={cn(
        'inline-block w-full rounded-md px-4 py-2 transition-colors hover:bg-bg-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-info focus-visible:ring-offset-2 sm:text-lg',
        depth === 2 && 'pl-8 text-sm sm:text-md',
        depth === 3 && 'pl-12 text-xs sm:text-sm',
        isActive && 'xl:bg-primary-bg xl:font-bold xl:text-fg-base',
      )}
      href={`#${text}`}
      onClick={() => onNavigate(text)}
    >
      {text}
    </Link>
  );
};

export const TableOfContext: FC<{
  headingTree: HeadingTree;
}> = ({ headingTree }) => {
  const [activeId, setActiveId] = useState<string>('');

  const ref = useClickAway<HTMLDetailsElement>(() => {
    if (ref.current) {
      ref.current.open = false;
    }
  });

  // リンククリック時のナビゲーション処理
  const handleNavigate = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  // IntersectionObserverで見出しを監視
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 交差している要素のうち、最も上にあるものを選択
        const intersectingEntries = entries.filter(
          (entry) => entry.isIntersecting,
        );

        if (intersectingEntries.length > 0) {
          // boundingClientRectのtopが最も小さい（画面上部に近い）要素を選択
          const topEntry = intersectingEntries.reduce((prev, current) =>
            prev.boundingClientRect.top < current.boundingClientRect.top
              ? prev
              : current,
          );
          setActiveId(topEntry.target.id);
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      },
    );

    // すべての見出し要素を監視
    const headings = document.querySelectorAll('h2[id], h3[id], h4[id]');
    headings.forEach((heading) => {
      observer.observe(heading);
    });
    const eocElement = document.getElementById(END_OF_CONTENT_ID);
    if (eocElement) {
      observer.observe(eocElement);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  if (headingTree.children.length === 0) {
    return null;
  }

  return (
    <details
      className={cn(
        'fixed w-80 rounded-md border border-border-mute bg-bg-base shadow-xl',
        'right-4 bottom-4 open:right-0 open:bottom-0 sm:right-16 sm:bottom-8 sm:open:right-16 sm:open:bottom-8',
        'open:details-content:border-border-mute open:details-content:border-t-2 open:details-content:p-4 open:details-content:pt-0',
      )}
      ref={ref}
    >
      <summary className="flex items-center gap-2 p-4 font-bold text-md text-primary-fg sm:text-lg">
        <ProgressBar activeId={activeId} headingTree={headingTree} />
        <span className="truncate">
          {activeId === ''
            ? 'もくじ'
            : activeId === END_OF_CONTENT_ID
              ? 'さいごまで よみました'
              : activeId}
        </span>
      </summary>
      <ul className="flex max-h-[75vh] flex-col overflow-y-scroll p-2 text-fg-base">
        {headingTree.children.map((depth1) => {
          if (depth1.children.length === 0) {
            return (
              <li key={depth1.text}>
                <LinkButton
                  depth={1}
                  isActive={activeId === depth1.text}
                  onNavigate={handleNavigate}
                  text={depth1.text}
                />
              </li>
            );
          }
          return (
            <li key={depth1.text}>
              <LinkButton
                depth={1}
                isActive={activeId === depth1.text}
                onNavigate={handleNavigate}
                text={depth1.text}
              />
              <ul>
                {depth1.children.map((depth2) => {
                  if (depth2.children.length === 0) {
                    return (
                      <li key={depth2.text}>
                        <LinkButton
                          depth={2}
                          isActive={activeId === depth2.text}
                          onNavigate={handleNavigate}
                          text={depth2.text}
                        />
                      </li>
                    );
                  }
                  return (
                    <li key={depth2.text}>
                      <LinkButton
                        depth={2}
                        isActive={activeId === depth2.text}
                        onNavigate={handleNavigate}
                        text={depth2.text}
                      />
                      <ul>
                        {depth2.children.map((depth3) => {
                          return (
                            <li key={depth3.text}>
                              <LinkButton
                                depth={3}
                                isActive={activeId === depth3.text}
                                onNavigate={handleNavigate}
                                text={depth3.text}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </details>
  );
};
