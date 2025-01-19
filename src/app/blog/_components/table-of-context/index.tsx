import { FC } from 'react';
import { remark } from 'remark';
import { readFileSync } from 'fs';
import type { Root } from 'mdast';
import Link from 'next/link';
import { unstable_cache as cache } from 'next/cache';

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

export const TableOfContext: FC<{ slug: string }> = async ({
  slug,
}) => {
  // Heading 2, 3, 4 のみをツリーに起こす
  let headingTree: HeadingTree = {
    depth: 0,
    children: [],
  };
  await cache(async (slug: string) =>
    remark()
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
      .process(
        readFileSync(
          process.cwd() + `/src/app/blog/${slug}/page.mdx`,
          'utf-8',
        ),
      ),
  )(slug);

  if (headingTree.children.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-4 rounded-lg bg-bgBase/90 p-4">
      <h3 className="text-lg font-bold text-textBody">目次</h3>
      <ol className="list-inside list-decimal text-sm text-textBody">
        {headingTree.children.map((depth1) => {
          if (depth1.children.length === 0) {
            return (
              <li key={depth1.text} className="pt-1">
                <Link
                  href={`#${depth1.text}`}
                  className="hover:underline"
                >
                  {depth1.text}
                </Link>
              </li>
            );
          }
          return (
            <li key={depth1.text} className="pt-1">
              <Link
                href={`#${depth1.text}`}
                className="hover:underline"
              >
                {depth1.text}
              </Link>
              <ol className="list-inside list-decimal pl-2">
                {depth1.children.map((depth2) => {
                  if (depth2.children.length === 0) {
                    return (
                      <li key={depth2.text} className="pt-1">
                        <Link
                          href={`#${depth2.text}`}
                          className="hover:underline"
                        >
                          {depth2.text}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={depth2.text} className="pt-1">
                      <Link href={`#${depth2.text}`}>
                        {depth2.text}
                      </Link>
                      <ol className="list-inside list-decimal pl-4">
                        {depth2.children.map((depth3) => {
                          return (
                            <li key={depth3.text} className="pt-1">
                              <Link
                                href={`#${depth3.text}`}
                                className="hover:underline"
                              >
                                {depth3.text}
                              </Link>
                            </li>
                          );
                        })}
                      </ol>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
