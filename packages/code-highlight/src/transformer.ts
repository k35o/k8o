import type { ShikiTransformer } from '@shikijs/types';
import type { Element, ElementContent } from 'hast';

import { parseDemoAllow, parseDemoName } from './demo.ts';
import { parseAnnotations } from './parser.ts';
import type { Annotation } from './parser.ts';

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

const createFoldMark = (): Element => ({
  type: 'element',
  tagName: 'span',
  properties: { class: 'code-annotate-fold-mark', ariaHidden: 'true' },
  children: [{ type: 'text', value: '⋯' }],
});

const createFold = (children: ElementContent[]): Element => ({
  type: 'element',
  tagName: 'span',
  properties: { class: 'code-annotate-fold' },
  children,
});

// コードフェンスのメタ (```ts title="foo.ts") からファイル名を取り出す。
// 否定文字クラス + * のみで組み、多項式バックトラッキングを避ける (CodeQL: js/polynomial-redos)
const parseFilename = (raw: string | undefined): string | undefined => {
  if (raw === undefined) return undefined;
  const matched = /\btitle=(?:"([^"]*)"|'([^']*)')/u.exec(raw);
  const value = (matched?.[1] ?? matched?.[2])?.trim();
  return value !== undefined && value.length > 0 ? value : undefined;
};

// title="selected.ts" のような引用符の中の語は目印に数えないよう、引用符の中を外してから探す
const hasSelected = (raw: string | undefined): boolean => {
  if (raw === undefined) return false;
  const unquoted = raw.replaceAll(/"[^"]*"|'[^']*'/gu, '');
  return /(?:^|\s)selected(?:\s|$)/u.test(unquoted);
};

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
    const hasFold = annotations.some((line) =>
      line.some((annotation) => annotation.type === 'fold'),
    );
    if (hasFold && parseDemoName(this.options.meta?.__raw) === undefined) {
      throw new Error(
        '[!fold] は動く例（demo="<名前>"）のコードブロックでだけ使える。省いた行は例の全文のビューでしか見られない',
      );
    }
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
        case 'fold':
          break;
      }
    }
    if (calloutsForLine.length > 0) {
      state.callouts.set(line - 1, calloutsForLine);
    }
  },
  pre(node): Element {
    const { lang } = this.options;
    const hasLang = lang !== '' && lang !== 'text' && lang !== 'plaintext';
    if (hasLang) {
      node.properties['data-lang'] = lang;
    }
    const filename = parseFilename(this.options.meta?.__raw);
    if (filename !== undefined) {
      node.properties['data-filename'] = filename;
    }
    const demo = parseDemoName(this.options.meta?.__raw);
    const allow = parseDemoAllow(this.options.meta?.__raw);
    // og と fold は行に印を付けないため、gutter の要否には数えない
    const state = (this.meta as AnnotateMeta).codeAnnotate;
    const hasVisibleAnnotation = (state?.annotations ?? []).some((line) =>
      line.some(
        (annotation) => annotation.type !== 'og' && annotation.type !== 'fold',
      ),
    );
    const label = filename ?? (hasLang ? lang : undefined);
    return {
      type: 'element',
      tagName: 'div',
      properties: {
        class: 'code-annotate-block',
        ...(label === undefined ? {} : { 'data-label': label }),
        ...(hasVisibleAnnotation ? { 'data-annotated': '' } : {}),
        ...(demo === undefined ? {} : { 'data-demo': demo }),
        ...(demo === undefined || allow.length === 0
          ? {}
          : { 'data-demo-allow': allow.join(' ') }),
        ...(hasSelected(this.options.meta?.__raw)
          ? { 'data-selected': '' }
          : {}),
      },
      children: [node],
    };
  },
  code(node) {
    const state = (this.meta as AnnotateMeta).codeAnnotate;
    if (!state) return;
    const folded = state.annotations.map((line) =>
      line.some((annotation) => annotation.type === 'fold'),
    );
    if (state.callouts.size === 0 && !folded.includes(true)) return;

    const result: ElementContent[] = [];
    let fold: ElementContent[] = [];
    const closeFold = (): void => {
      if (fold.length === 0) return;
      result.push(createFoldMark(), createFold(fold));
      fold = [];
    };

    let lineIdx = 0;
    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      if (!child) continue;
      if (
        child.type !== 'element' ||
        child.tagName !== 'span' ||
        !hasLineClass(child)
      ) {
        closeFold();
        result.push(child);
        continue;
      }

      const lineNodes: ElementContent[] = [child];
      const texts = state.callouts.get(lineIdx);
      const next = node.children[i + 1];
      if (next?.type === 'text' && next.value === '\n') {
        lineNodes.push(next);
        i += 1;
      }
      if (texts) {
        const indent = state.indents[lineIdx] ?? 0;
        for (const text of texts) {
          lineNodes.push(createCalloutLine(text, indent), {
            type: 'text',
            value: '\n',
          });
        }
      }
      if (folded[lineIdx] === true) {
        fold.push(...lineNodes);
      } else {
        closeFold();
        result.push(...lineNodes);
      }
      lineIdx += 1;
    }
    closeFold();
    node.children = result;
  },
});
