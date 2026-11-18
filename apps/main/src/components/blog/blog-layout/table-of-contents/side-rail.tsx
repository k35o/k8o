'use client';

import { cn } from '@repo/helpers/cn';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

import type { HeadingTree } from '@/features/blog/interface/queries';

import { END_OF_CONTENT_ID } from '../constants';
import { useWritingMode } from '../writing-mode/writing-mode-context';
import { ProgressBar } from './progress-bar';
import { TocItem } from './toc-item';
import { useActiveHeading } from './use-active-heading';

import styles from './side-rail.module.css';

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
    const active = list.querySelector(`a[href="#${CSS.escape(activeId)}"]`);
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
    // 縦書きでは一覧を描画しないので観測対象がない
    if (mode === 'vertical') return undefined;
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
    <nav aria-label="もくじ" className={cn(styles.root, className)}>
      <div className={styles.panel} ref={scrollerRef}>
        <div className={styles.heading}>
          <p className={styles.title} data-complete={isComplete}>
            {isComplete ? 'さいごまで よみました' : 'もくじ'}
          </p>
          <ProgressBar activeId={activeId} headingTree={headingTree} />
        </div>
        <div className={styles.tree} ref={listRef}>
          <div aria-hidden="true" className={styles.rail} />
          <div
            aria-hidden="true"
            className={styles.trail}
            style={{ height: trailHeight }}
          />
          {marker && (
            <div
              aria-hidden="true"
              className={styles.marker}
              style={{
                height: `${marker.height.toString()}px`,
                transform: `translateY(${marker.top.toString()}px)`,
              }}
            />
          )}
          <ul className={styles.list}>
            {headingTree.children.map((node) => (
              <TocItem
                activeId={activeId}
                depth={1}
                key={node.text}
                linkClassName={styles.link}
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
