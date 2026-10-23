import remarkPreset from '@repo/mdx-preset/remark';
import type { Nodes } from 'mdast';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';

// 本番の MDX と同じ preset で読む。remark-math がないと数式の {} が MDX の式として解釈される
const parser = remark().use(remarkMdx).use(remarkPreset);

const linkCardHref = (node: Nodes): string | undefined => {
  if (
    (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') ||
    node.name !== 'LinkCard'
  ) {
    return undefined;
  }
  for (const attribute of node.attributes) {
    if (
      attribute.type === 'mdxJsxAttribute' &&
      attribute.name === 'href' &&
      typeof attribute.value === 'string'
    ) {
      return attribute.value;
    }
  }
  return undefined;
};

const collect = (node: Nodes): string[] => {
  const href = linkCardHref(node);
  const children =
    'children' in node ? node.children.flatMap((child) => collect(child)) : [];
  return href === undefined ? children : [href, ...children];
};

export const collectLinkCardHrefs = (source: string): string[] =>
  collect(parser.parse(source));
