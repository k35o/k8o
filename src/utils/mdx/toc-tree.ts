import { readFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
import { Root } from 'mdast';
import { unstable_cache as cache } from 'next/cache';
import { remark } from 'remark';

type HeadingTree = {
  depth: 0;
  children: {
    depth: 1;
    text: string;
    children: {
      depth: 2;
      text: string;
      children: {
        depth: 3;
        text: string;
      }[];
    }[];
  }[];
};

export const getTocTree = async (slug: string) => {
  let headingTree: HeadingTree = {
    depth: 0,
    children: [],
  };
  const content = await readFile(
    join(cwd(), `/src/app/blog/${slug}/page.mdx`),
    'utf-8',
  );
  await remark()
    .use(function () {
      return (tree: Root) => {
        for (const content of tree.children) {
          if (content.type !== 'heading') {
            continue;
          }
          if (
            content.children[0]?.type !== 'text' ||
            content.depth > 4
          ) {
            continue;
          }

          if (content.depth === 2) {
            headingTree.children.push({
              depth: 1,
              text: content.children[0].value,
              children: [],
            });
            continue;
          }
          if (content.depth === 3) {
            const depth1Length = headingTree.children.length;
            const depth1RestTree = headingTree.children.slice(
              0,
              depth1Length - 1,
            );
            const depth1LastTree =
              headingTree.children[depth1Length - 1];
            if (!depth1LastTree) {
              continue;
            }
            headingTree = {
              ...headingTree,
              children: [
                ...depth1RestTree,
                {
                  ...depth1LastTree,
                  children: [
                    ...depth1LastTree.children,
                    {
                      depth: 2,
                      text: content.children[0].value,
                      children: [],
                    },
                  ],
                },
              ],
            };
            continue;
          }
          if (content.depth === 4) {
            const depth1Length = headingTree.children.length;
            const depth1RestTree = headingTree.children.slice(
              0,
              depth1Length - 1,
            );
            const depth1LastTree =
              headingTree.children[depth1Length - 1];

            if (!depth1LastTree) {
              continue;
            }

            const depth2Length = depth1LastTree.children.length;
            const depth2RestTree = depth1LastTree.children.slice(
              0,
              depth2Length - 1,
            );
            const depth2LastTree =
              depth1LastTree.children[depth2Length - 1];

            if (!depth2LastTree) {
              continue;
            }

            headingTree = {
              ...headingTree,
              children: [
                ...depth1RestTree,
                {
                  ...depth1LastTree,
                  children: [
                    ...depth2RestTree,
                    {
                      ...depth2LastTree,
                      children: [
                        ...depth2LastTree.children,
                        {
                          depth: 3,
                          text: content.children[0].value,
                        },
                      ],
                    },
                  ],
                },
              ],
            };
            continue;
          }
        }
      };
    })
    .process(content);
  return headingTree;
};

export const getTocTreeWithCache = cache((slug: string) =>
  getTocTree(slug),
);
