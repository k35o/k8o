import { readFile } from 'node:fs/promises';

import type { PhrasingContent, Root } from 'mdast';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';

import type { HeadingTree } from './types';

// インラインコードや強調を含む見出しでも全文を採用する。
// mdx-components.tsx の LinkHeading が id に使うテキスト抽出と同じ結果になる必要がある
const phrasingText = (nodes: readonly PhrasingContent[]): string => {
  let result = '';
  for (const node of nodes) {
    if (node.type === 'text' || node.type === 'inlineCode') {
      result += node.value;
      continue;
    }
    if ('children' in node) {
      result += phrasingText(node.children);
    }
  }
  return result;
};

export const getTocTree = async (path: string) => {
  const headingTree: HeadingTree = {
    depth: 0,
    children: [],
  };
  const content = await readFile(path, 'utf-8');
  await remark()
    .use(remarkFrontmatter)
    .use(() => (tree: Root) => {
      for (const node of tree.children) {
        if (node.type !== 'heading') {
          continue;
        }
        if (node.depth > 4) {
          continue;
        }
        const text = phrasingText(node.children);
        if (text === '') {
          continue;
        }

        if (node.depth === 2) {
          headingTree.children.push({
            depth: 1,
            text,
            children: [],
          });
          continue;
        }
        if (node.depth === 3) {
          const depth1LastTree = headingTree.children.at(-1);
          if (!depth1LastTree) {
            continue;
          }
          depth1LastTree.children.push({
            depth: 2,
            text,
            children: [],
          });
          continue;
        }
        if (node.depth === 4) {
          const depth1LastTree = headingTree.children.at(-1);

          if (!depth1LastTree) {
            continue;
          }

          const depth2LastTree = depth1LastTree.children.at(-1);

          if (!depth2LastTree) {
            continue;
          }

          depth2LastTree.children.push({
            depth: 3,
            text,
          });
        }
      }
    })
    .process(content);
  return headingTree;
};
