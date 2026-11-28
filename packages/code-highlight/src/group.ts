import type { Element, Nodes, Parent, Root } from 'hast';

import { DEMO_TAG } from './demo.ts';

const BLOCK_CLASS = 'code-annotate-block';
export const GROUP_TAG = 'code-group';

const hasClass = (node: Nodes, className: string): node is Element => {
  if (node.type !== 'element') return false;
  const raw = node.properties['class'];
  if (typeof raw === 'string') return raw.split(/\s+/u).includes(className);
  if (Array.isArray(raw)) return raw.map(String).includes(className);
  return false;
};

const isBlankText = (node: Nodes): boolean =>
  node.type === 'text' && node.value.trim() === '';

// @shikijs/rehype は pre を root フラグメントで包んで差し替えるので、包みを外して判定する
const asCodeBlock = (node: Nodes): Element | undefined => {
  if (hasClass(node, BLOCK_CLASS)) return node;
  if (node.type !== 'root') return undefined;
  const elements = node.children.filter((child) => !isBlankText(child));
  const [only] = elements;
  return elements.length === 1 &&
    only !== undefined &&
    hasClass(only, BLOCK_CLASS)
    ? only
    : undefined;
};

const demoOf = (block: Element): string | undefined => {
  const raw = block.properties['data-demo'];
  return typeof raw === 'string' ? raw : undefined;
};

const isSelected = (block: Element): boolean =>
  block.properties['data-selected'] !== undefined;

const createGroup = (blocks: Element[]): Element => ({
  type: 'element',
  tagName: GROUP_TAG,
  properties: {},
  children: blocks,
});

// 権限はどのブロックのメタに書いてもよく、例のブロックに書かれたものを合わせる
const allowOf = (blocks: readonly Element[]): string =>
  [
    ...new Set(
      blocks.flatMap((block) => {
        const raw = block.properties['data-demo-allow'];
        return typeof raw === 'string' ? raw.split(' ') : [];
      }),
    ),
  ].join(' ');

const createDemo = (
  name: string,
  blocks: readonly Element[],
  children: Element[],
): Element => {
  const allow = allowOf(blocks);
  return {
    type: 'element',
    tagName: DEMO_TAG,
    properties: { name, ...(allow === '' ? {} : { allow }) },
    children,
  };
};

export const groupAdjacentCodeBlocks = (tree: Root | Parent): void => {
  const next: Nodes[] = [];
  let run: Element[] = [];
  let pendingBlank: Nodes[] = [];

  const flush = (): void => {
    const selected = run.filter(isSelected).length;
    if (selected > 1) {
      throw new Error('selected は1つのまとまりに1つだけ書ける');
    }
    if (selected === 1 && run.length < 2) {
      throw new Error(
        'selected は、隣り合うコードブロックのタブの1つにだけ書ける',
      );
    }
    const blocks = run.length >= 2 ? [createGroup(run)] : run;
    const demo = run[0] === undefined ? undefined : demoOf(run[0]);
    if (demo === undefined) {
      next.push(...blocks);
    } else {
      next.push(createDemo(demo, run, blocks));
    }
    next.push(...pendingBlank);
    run = [];
    pendingBlank = [];
  };

  for (const child of tree.children as Nodes[]) {
    if (child.type === 'element') {
      groupAdjacentCodeBlocks(child);
    }
    const block = asCodeBlock(child);
    if (block !== undefined) {
      if (run[0] !== undefined && demoOf(run[0]) !== demoOf(block)) {
        flush();
      } else {
        pendingBlank = [];
      }
      run.push(block);
      continue;
    }
    if (run.length > 0 && isBlankText(child)) {
      pendingBlank.push(child);
      continue;
    }
    flush();
    next.push(child);
  }
  flush();
  tree.children = next as Parent['children'];
};
