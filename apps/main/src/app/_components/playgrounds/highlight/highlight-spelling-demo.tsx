'use client';

import { useEffect, useRef } from 'react';
import type { FC } from 'react';

const text = '食べれる';
const HIGHLIGHT_NAME = 'highlight-example3';

export const HighlightSpellingDemo: FC = () => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const textNode = ref.current?.firstChild;
    if (!textNode) return undefined;

    const range = new Range();
    range.setStart(textNode, 2);
    range.setEnd(textNode, text.length);

    const highlight = new Highlight(range);
    highlight.type = 'spelling-error';
    CSS.highlights.set(HIGHLIGHT_NAME, highlight);
    return () => {
      CSS.highlights.delete(HIGHLIGHT_NAME);
    };
  }, []);

  return (
    <>
      <p ref={ref}>{text}</p>
      <style>
        {`::highlight(${HIGHLIGHT_NAME}) {
            background-color: var(--color-bg-error);
            color: var(--color-fg-error);
          }`}
      </style>
    </>
  );
};
