'use client';

import { useEffect, useRef } from 'react';
import type { FC } from 'react';

const text = '知らざるを知らずとなす、これ知るなり';
const HIGHLIGHT_NAME = 'highlight-example1';

export const HighlightBasicDemo: FC = () => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const textNode = ref.current?.firstChild;
    if (!textNode) return undefined;

    const range = new Range();
    range.setStart(textNode, 12);
    range.setEnd(textNode, text.length);

    CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(range));
    return () => {
      CSS.highlights.delete(HIGHLIGHT_NAME);
    };
  }, []);

  return (
    <>
      <p ref={ref}>{text}</p>
      <style>
        {`::highlight(${HIGHLIGHT_NAME}) {
            background-color: var(--color-bg-warning);
            color: var(--color-fg-warning);
          }`}
      </style>
    </>
  );
};
