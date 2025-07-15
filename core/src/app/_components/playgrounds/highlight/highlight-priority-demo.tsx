'use client';

import { FC, useEffect, useRef } from 'react';

const text = 'Imagination is more important than knowledge';

export const HighlightPriorityDemo: FC = () => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current?.firstChild) return;
    const textNode = ref.current.firstChild;

    const range1 = new Range();
    range1.setStart(textNode, 0);
    range1.setEnd(textNode, 11);
    const highlight1 = new Highlight(range1);
    highlight1.priority = 1;

    const range2 = new Range();
    range2.setStart(textNode, 0);
    range2.setEnd(textNode, 11);
    const highlight2 = new Highlight(range2);
    highlight2.priority = 1;

    const range3 = new Range();
    range3.setStart(textNode, 0);
    range3.setEnd(textNode, 11);
    const highlight3 = new Highlight(range3);

    CSS.highlights.set('highlight-example2-1', highlight1);
    CSS.highlights.set('highlight-example2-2', highlight2);
    CSS.highlights.set('highlight-example2-3', highlight3);
  }, []);

  return (
    <>
      <p ref={ref}>{text}</p>
      <style>
        {`
          ::highlight(highlight-example2-1) {
            background-color: var(--color-bg-info);
            color: var(--color-fg-info);
          }
          ::highlight(highlight-example2-2) {
            background-color: var(--color-bg-warning);
            color: var(--color-fg-warning);
          }
          ::highlight(highlight-example2-3) {
            background-color: var(--color-bg-error);
            color: var(--color-fg-error);
          }
        `}
      </style>
    </>
  );
};
