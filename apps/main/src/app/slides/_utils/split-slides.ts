import { Children, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { NOTES_ROLE } from './notes-marker';

export type Slide = {
  content: ReactNode[];
  notes: ReactNode[];
};

const isHrElement = (node: ReactNode): boolean =>
  isValidElement(node) && node.type === 'hr';

const isNotesElement = (
  node: ReactNode,
): node is ReactElement<{ children: ReactNode }> => {
  if (!isValidElement(node)) return false;
  const { type } = node;
  if (typeof type !== 'function') return false;
  return (type as { $$slideRole?: string }).$$slideRole === NOTES_ROLE;
};

export const splitSlides = (children: ReactNode): Slide[] => {
  const slides: Slide[] = [{ content: [], notes: [] }];
  for (const child of Children.toArray(children)) {
    const current = slides.at(-1);
    if (current === undefined) continue;

    if (isHrElement(child)) {
      slides.push({ content: [], notes: [] });
      continue;
    }

    if (isNotesElement(child)) {
      current.notes.push(child.props.children);
      continue;
    }

    current.content.push(child);
  }
  return slides;
};
