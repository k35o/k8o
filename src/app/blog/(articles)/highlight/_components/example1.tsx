'use client';

import { FC, useEffect, useRef } from 'react';

const text = '知らざるを知らずとなす、これ知るなり';

export const Example1: FC = () => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current?.firstChild) return;
    const textNode = ref.current.firstChild;

    const range = new Range();
    range.setStart(textNode, 12);
    range.setEnd(textNode, text.length);

    const highlight = new Highlight(range);

    CSS.highlights.set('highlight-example1', highlight);
  }, []);

  return (
    <>
      <p ref={ref}>{text}</p>
      <style>
        {`::highlight(highlight-example1) {
            background-color: var(--color-bg-warning);
            color: var(--color-fg-warning);
          }`}
      </style>
    </>
  );
};
