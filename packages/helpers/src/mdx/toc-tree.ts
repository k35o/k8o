import { readFile } from 'node:fs/promises';
import type { Root } from 'mdast';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';

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

export const getTocTree = async (path: string) => {
  let headingTree: HeadingTree = {
    depth: 0,
    children: [],
  };
  const content = await readFile(path, 'utf-8');
  await remark()
    .use(remarkFrontmatter)
    .use(() => (tree: Root) => {
      for (const content of tree.children) {
        if (content.type !== 'heading') {
          continue;
        }
        if (content.children[0]?.type !== 'text' || content.depth > 4) {
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
          const depth1LastTree = headingTree.children[depth1Length - 1];
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
          const depth1LastTree = headingTree.children[depth1Length - 1];

          if (!depth1LastTree) {
            continue;
          }

          const depth2Length = depth1LastTree.children.length;
          const depth2RestTree = depth1LastTree.children.slice(
            0,
            depth2Length - 1,
          );
          const depth2LastTree = depth1LastTree.children[depth2Length - 1];

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
        }
      }
    })
    .process(content);
  return headingTree;
};

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;

  // readFileのモック
  vi.mock('node:fs/promises', () => ({
    readFile: vi.fn(),
  }));

  describe('getTocTree', () => {
    describe('正常な入力の場合', () => {
      it('depth 2の見出しのみの場合、正しいツリーを生成できるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue('## Heading 1\n## Heading 2');

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [
            { depth: 1, text: 'Heading 1', children: [] },
            { depth: 1, text: 'Heading 2', children: [] },
          ],
        });
      });

      it('depth 2-3のネストされた見出しを生成できるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue(
          '## Parent\n### Child 1\n### Child 2',
        );

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [
            {
              depth: 1,
              text: 'Parent',
              children: [
                { depth: 2, text: 'Child 1', children: [] },
                { depth: 2, text: 'Child 2', children: [] },
              ],
            },
          ],
        });
      });

      it('depth 2-3-4の深くネストされた見出しを生成できるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue(
          '## Parent\n### Child\n#### Grandchild 1\n#### Grandchild 2',
        );

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [
            {
              depth: 1,
              text: 'Parent',
              children: [
                {
                  depth: 2,
                  text: 'Child',
                  children: [
                    { depth: 3, text: 'Grandchild 1' },
                    { depth: 3, text: 'Grandchild 2' },
                  ],
                },
              ],
            },
          ],
        });
      });

      it('複数の独立した見出しツリーを生成できるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue(
          '## Section 1\n### Sub 1\n## Section 2\n### Sub 2',
        );

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [
            {
              depth: 1,
              text: 'Section 1',
              children: [{ depth: 2, text: 'Sub 1', children: [] }],
            },
            {
              depth: 1,
              text: 'Section 2',
              children: [{ depth: 2, text: 'Sub 2', children: [] }],
            },
          ],
        });
      });

      it('frontmatterを含むMDXファイルを処理できるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue(
          '---\ntitle: Test\n---\n## Heading',
        );

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [{ depth: 1, text: 'Heading', children: [] }],
        });
      });
    });

    describe('異常な入力の場合', () => {
      it('見出しがない場合は空の配列を返すべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue('This is plain text.');

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [],
        });
      });

      it('depth 1の見出しのみの場合は無視されるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue('# Heading 1\n# Heading 2');

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [],
        });
      });

      it('depth 5以上の見出しは無視されるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue(
          '## Valid\n##### Too deep\n###### Also too deep',
        );

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [{ depth: 1, text: 'Valid', children: [] }],
        });
      });

      it('空ファイルの場合は空の配列を返すべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue('');

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [],
        });
      });
    });

    describe('エッジケースの場合', () => {
      it('親なしでdepth 3が来た場合は無視されるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue('### Orphan Child');

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [],
        });
      });

      it('親なしでdepth 4が来た場合は無視されるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue('#### Orphan Grandchild');

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [],
        });
      });

      it('depth 2の親なしでdepth 4が来た場合は無視されるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue(
          '## Parent\n#### Orphan Grandchild',
        );

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [{ depth: 1, text: 'Parent', children: [] }],
        });
      });

      it('非連続の見出しレベルを処理できるべき', async () => {
        const { readFile: mockReadFile } = await import('node:fs/promises');
        vi.mocked(mockReadFile).mockResolvedValue(
          '## Section\n#### Deep (skipped 3)',
        );

        const result = await getTocTree('test.mdx');
        expect(result).toEqual({
          depth: 0,
          children: [{ depth: 1, text: 'Section', children: [] }],
        });
      });
    });
  });
}
