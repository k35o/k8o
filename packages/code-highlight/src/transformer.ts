import type { ShikiTransformer } from '@shikijs/types';
import type { Element, ElementContent } from 'hast';

import { type Annotation, parseAnnotations } from './parser.ts';

type AnnotateMeta = {
  codeAnnotate?: {
    annotations: Annotation[][];
    callouts: Map<number, string[]>;
    indents: number[];
  };
};

const createCalloutLine = (text: string, indent: number): Element => ({
  type: 'element',
  tagName: 'span',
  properties: {
    class: 'line code-annotate-callout-line',
    ...(indent > 0
      ? { style: `padding-inline-start: calc(1.2em + ${indent}ch);` }
      : {}),
  },
  children: [
    {
      type: 'element',
      tagName: 'span',
      properties: { class: 'code-annotate-callout-text' },
      children: [{ type: 'text', value: text }],
    },
  ],
});

const hasLineClass = (node: Element): boolean => {
  const raw = node.properties['class'];
  if (typeof raw === 'string') return raw.split(/\s+/u).includes('line');
  if (Array.isArray(raw)) return raw.map(String).includes('line');
  return false;
};

export const annotateTransformer = (): ShikiTransformer => ({
  name: '@repo/code-highlight',
  preprocess(code) {
    const { code: stripped, annotations } = parseAnnotations(code);
    const indents = stripped
      .split('\n')
      .map((line) => /^\s*/u.exec(line)?.[0].length ?? 0);
    (this.meta as AnnotateMeta).codeAnnotate = {
      annotations,
      callouts: new Map(),
      indents,
    };
    return stripped;
  },
  line(node, line) {
    const state = (this.meta as AnnotateMeta).codeAnnotate;
    if (!state) return;
    const annotations = state.annotations[line - 1];
    if (!annotations || annotations.length === 0) return;

    const calloutsForLine: string[] = [];
    for (const annotation of annotations) {
      switch (annotation.type) {
        case 'highlight':
          this.addClassToHast(node, 'code-annotate-highlight');
          break;
        case 'add':
          this.addClassToHast(node, 'code-annotate-add');
          break;
        case 'remove':
          this.addClassToHast(node, 'code-annotate-remove');
          break;
        case 'callout':
          this.addClassToHast(node, 'code-annotate-has-callout');
          calloutsForLine.push(annotation.text);
          break;
        case 'og':
          break;
      }
    }
    if (calloutsForLine.length > 0) {
      state.callouts.set(line - 1, calloutsForLine);
    }
  },
  pre(node): Element {
    return {
      type: 'element',
      tagName: 'div',
      properties: { class: 'code-annotate-block' },
      children: [node],
    };
  },
  code(node) {
    const state = (this.meta as AnnotateMeta).codeAnnotate;
    if (!state || state.callouts.size === 0) return;

    const result: ElementContent[] = [];
    let lineIdx = 0;
    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      if (!child) continue;
      result.push(child);

      if (
        child.type === 'element' &&
        child.tagName === 'span' &&
        hasLineClass(child)
      ) {
        const texts = state.callouts.get(lineIdx);
        if (texts) {
          const next = node.children[i + 1];
          if (next?.type === 'text' && next.value === '\n') {
            result.push(next);
            i += 1;
          }
          const indent = state.indents[lineIdx] ?? 0;
          for (const text of texts) {
            result.push(createCalloutLine(text, indent), {
              type: 'text',
              value: '\n',
            });
          }
        }
        lineIdx += 1;
      }
    }
    node.children = result;
  },
});
