'use client';

import { type FC, useEffect, useRef } from 'react';

const text = '食べれる';

export const HighlightSpellingDemo: FC = () => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current?.firstChild) return;
    const textNode = ref.current.firstChild;

    const range = new Range();
    range.setStart(textNode, 2);
    range.setEnd(textNode, text.length);

    const highlight = new Highlight(range);
    highlight.type = 'spelling-error';

    CSS.highlights.set('highlight-example3', highlight);
  }, []);

  return (
    <>
      <p ref={ref}>{text}</p>
      <style>
        {`::highlight(highlight-example3) {
            background-color: var(--color-bg-error);
            color: var(--color-fg-error);
          }`}
      </style>
    </>
  );
};
