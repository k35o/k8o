import { readFile } from 'node:fs/promises';

import type { Root } from 'mdast';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';

import type { HeadingTree } from './types';

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
        if (node.children[0]?.type !== 'text' || node.depth > 4) {
          continue;
        }

        if (node.depth === 2) {
          headingTree.children.push({
            depth: 1,
            text: node.children[0].value,
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
            text: node.children[0].value,
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
            text: node.children[0].value,
          });
        }
      }
    })
    .process(content);
  return headingTree;
};
