'use client';

import { cn } from '@repo/helpers/cn';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

import type { HeadingTree } from '@/shared/mdx/types';

import { END_OF_CONTENT_ID } from '../constants';
import { useWritingMode } from '../writing-mode/writing-mode-context';
import { ProgressBar } from './progress-bar';
import { useActiveHeading } from './use-active-heading';

type TocNode = {
  text: string;
  children?: readonly TocNode[];
};

const RailItem: FC<{
  node: TocNode;
  depth: number;
  activeId: string;
  onNavigate: (id: string) => void;
}> = ({ node, depth, activeId, onNavigate }) => {
  const isActive = activeId === node.text;
  return (
    <li className={cn(depth === 1 && '[&:not(:first-child)]:mt-1')}>
      <Link
        aria-current={isActive ? 'location' : undefined}
        className={cn(
          'block rounded-r-lg py-1.5 pr-2 leading-relaxed transition-colors duration-150 ease-out',
          'focus-visible:ring-border-info focus-visible:outline-none focus-visible:ring-2',
          depth === 1 && 'pl-5 text-sm',
          depth === 2 && 'pl-11 text-xs',
          depth === 3 && 'pl-14 text-xs',
          isActive
            ? 'text-fg-base font-bold'
            : 'text-fg-mute hover:text-fg-base',
        )}
        href={`#${node.text}`}
        onClick={() => {
          onNavigate(node.text);
        }}
      >
        {node.text}
      </Link>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <RailItem
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
};

export const TableOfContentsSideRail: FC<{
  headingTree: HeadingTree;
  className?: string;
}> = ({ headingTree, className }) => {
  const [activeId, setActiveId] = useActiveHeading();
  const { mode } = useWritingMode();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [marker, setMarker] = useState<{ top: number; height: number } | null>(
    null,
  );

  const isComplete = activeId === END_OF_CONTENT_ID;

  const measureMarker = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector('[aria-current="location"]');
    if (!(active instanceof HTMLElement)) {
      setMarker(null);
      return;
    }
    const next = { top: active.offsetTop, height: active.offsetHeight };
    setMarker((prev) =>
      prev && prev.top === next.top && prev.height === next.height
        ? prev
        : next,
    );
  }, []);

  useEffect(() => {
    measureMarker();

    const list = listRef.current;
    const scroller = scrollerRef.current;
    if (!list || !scroller) return;
    const active = list.querySelector('[aria-current="location"]');
    if (!(active instanceof HTMLElement)) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    if (activeRect.top < scrollerRect.top + 16) {
      scroller.scrollTop += activeRect.top - scrollerRect.top - 16;
    } else if (activeRect.bottom > scrollerRect.bottom - 16) {
      scroller.scrollTop += activeRect.bottom - scrollerRect.bottom + 16;
    }
  }, [activeId, measureMarker]);

  // リサイズやフォント読込で項目の折り返しが変わってもマーカー位置を追従させる
  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const observer = new ResizeObserver(() => {
      measureMarker();
    });
    observer.observe(list);
    return () => {
      observer.disconnect();
    };
  }, [measureMarker, mode]);

  if (mode === 'vertical') return null;
  if (headingTree.children.length === 0) return null;

  const trailHeight = isComplete
    ? '100%'
    : `${(marker ? marker.top + marker.height : 0).toString()}px`;

  return (
    <nav aria-label="もくじ" className={cn('w-64 shrink-0', className)}>
      <div
        className="bg-bg-raised sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain rounded-xl p-4 shadow-md"
        ref={scrollerRef}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <p
            className={cn(
              'text-sm font-bold transition-colors duration-150 ease-out',
              isComplete ? 'text-primary-fg' : 'text-fg-base',
            )}
          >
            {isComplete ? 'さいごまで よみました' : 'もくじ'}
          </p>
          <ProgressBar activeId={activeId} headingTree={headingTree} />
        </div>
        <div className="relative" ref={listRef}>
          <div
            aria-hidden="true"
            className="bg-border-mute absolute inset-y-0 left-0 w-px"
          />
          <div
            aria-hidden="true"
            className="bg-primary-bg absolute top-0 left-0 w-px transition-[height] duration-300 ease-out"
            style={{ height: trailHeight }}
          />
          {marker && (
            <div
              aria-hidden="true"
              className="bg-primary-bg absolute -left-px w-0.75 rounded-full transition-[transform,height] duration-300 ease-out"
              style={{
                height: `${marker.height.toString()}px`,
                transform: `translateY(${marker.top.toString()}px)`,
              }}
            />
          )}
          <ul className="flex flex-col">
            {headingTree.children.map((node) => (
              <RailItem
                activeId={activeId}
                depth={1}
                key={node.text}
                node={node}
                onNavigate={setActiveId}
              />
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};
