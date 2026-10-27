'use client';

import {
  Children,
  isValidElement,
  startTransition,
  useId,
  useState,
  ViewTransition,
} from 'react';
import type { FC, KeyboardEvent, ReactNode } from 'react';

type BlockProps = { 'data-label'?: string };

const labelOf = (props: unknown, index: number): string => {
  const label = (props as BlockProps)['data-label'];
  return label ?? `code ${(index + 1).toString()}`;
};

export const CodeGroup: FC<{ children?: ReactNode }> = ({ children }) => {
  const blocks = Children.toArray(children).filter((child) =>
    isValidElement(child),
  );
  const [active, setActive] = useState(0);
  const id = useId();
  const tabId = (index: number): string => `${id}-tab-${index.toString()}`;
  const panelId = (index: number): string => `${id}-panel-${index.toString()}`;

  const select = (index: number): void => {
    startTransition(() => {
      setActive(index);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    const last = blocks.length - 1;
    const destinations: Record<string, number> = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    const next = destinations[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const tabs =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]',
      );
    tabs?.[next]?.focus();
    select(next);
  };

  return (
    // ページ遷移など無関係な transition でグループ単体が出入りのアニメーションをしないよう切る
    <ViewTransition enter="none" exit="none" update="code-group">
      <div className="code-annotate-group">
        <div
          aria-label="表示するコード"
          className="code-annotate-group-tabs"
          role="tablist"
        >
          {blocks.map((block, index) => (
            <button
              aria-controls={panelId(index)}
              aria-selected={index === active}
              className="code-annotate-group-tab"
              id={tabId(index)}
              key={block.key}
              onClick={() => {
                select(index);
              }}
              onKeyDown={handleKeyDown}
              role="tab"
              tabIndex={index === active ? 0 : -1}
              type="button"
            >
              {labelOf(block.props, index)}
            </button>
          ))}
        </div>
        {blocks.map((block, index) => (
          <div
            aria-labelledby={tabId(index)}
            hidden={index !== active}
            id={panelId(index)}
            key={block.key}
            role="tabpanel"
          >
            {block}
          </div>
        ))}
      </div>
    </ViewTransition>
  );
};
