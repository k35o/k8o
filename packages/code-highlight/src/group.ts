import type { Element, Nodes, Parent, Root } from 'hast';

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

const createGroup = (blocks: Element[]): Element => ({
  type: 'element',
  tagName: GROUP_TAG,
  properties: {},
  children: blocks,
});

export const groupAdjacentCodeBlocks = (tree: Root | Parent): void => {
  const next: Nodes[] = [];
  let run: Element[] = [];
  let pendingBlank: Nodes[] = [];

  const flush = (): void => {
    if (run.length >= 2) {
      next.push(createGroup(run));
    } else {
      next.push(...run);
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
      if (run.length > 0) pendingBlank = [];
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
