'use client';

import { useEffect, useRef } from 'react';
import type { FC } from 'react';

const text = 'Imagination is more important than knowledge';
const HIGHLIGHT_NAMES = [
  'highlight-example2-1',
  'highlight-example2-2',
  'highlight-example2-3',
] as const;

export const HighlightPriorityDemo: FC = () => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!('highlights' in CSS) || typeof Highlight === 'undefined') {
      return undefined;
    }
    const textNode = ref.current?.firstChild;
    if (!textNode) return undefined;

    const createHighlight = (priority?: number): Highlight => {
      const range = new Range();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 11);
      const highlight = new Highlight(range);
      if (priority !== undefined) highlight.priority = priority;
      return highlight;
    };

    CSS.highlights.set(HIGHLIGHT_NAMES[0], createHighlight(1));
    CSS.highlights.set(HIGHLIGHT_NAMES[1], createHighlight(1));
    CSS.highlights.set(HIGHLIGHT_NAMES[2], createHighlight());
    return () => {
      for (const name of HIGHLIGHT_NAMES) {
        CSS.highlights.delete(name);
      }
    };
  }, []);

  return (
    <>
      <p ref={ref}>{text}</p>
      <style>
        {`
          ::highlight(${HIGHLIGHT_NAMES[0]}) {
            background-color: var(--color-bg-info);
            color: var(--color-fg-info);
          }
          ::highlight(${HIGHLIGHT_NAMES[1]}) {
            background-color: var(--color-bg-warning);
            color: var(--color-fg-warning);
          }
          ::highlight(${HIGHLIGHT_NAMES[2]}) {
            background-color: var(--color-bg-error);
            color: var(--color-fg-error);
          }
        `}
      </style>
    </>
  );
};
