import remarkPreset from '@repo/mdx-preset/remark';
import type { Nodes, Root } from 'mdast';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';

export type MdxJsxElement = Extract<
  Nodes,
  { type: 'mdxJsxFlowElement' | 'mdxJsxTextElement' }
>;

// 本番の MDX（vite.config.ts の @mdx-js/rollup）と同じ remark の preset で読む。remark-math がないと
// $\mathbb{N}$ のような数式の中の {} が MDX の式として解釈されて、読めずに投げる
export const mdxParser = remark().use(remarkMdx).use(remarkPreset);

export const isMdxJsxElement = (node: Nodes): node is MdxJsxElement =>
  node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';

// 式（{...}）で書いた値は読まず、文字列で書いた値だけを返す
export const stringAttribute = (
  node: MdxJsxElement,
  name: string,
): string | undefined => {
  for (const attribute of node.attributes) {
    if (
      attribute.type === 'mdxJsxAttribute' &&
      attribute.name === name &&
      typeof attribute.value === 'string'
    ) {
      return attribute.value;
    }
  }
  return undefined;
};

// コードブロックの中の import 文は数えず、MDX の ESM の import だけを見る
export const esmImportSources = (tree: Root): string[] =>
  tree.children
    .flatMap((node) =>
      node.type === 'mdxjsEsm' ? (node.data?.estree?.body ?? []) : [],
    )
    .flatMap((statement) =>
      statement.type === 'ImportDeclaration'
        ? [String(statement.source.value)]
        : [],
    );
