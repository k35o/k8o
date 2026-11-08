import type { Nodes } from 'mdast';

// main の scripts の generate-link-card-metadata が Node で読むので、alias を使わずに相対で読む
import {
  isMdxJsxElement,
  mdxParser,
  stringAttribute,
} from '../../../shared/mdx/mdx-tree.ts';

const collect = (node: Nodes): string[] => {
  const href =
    isMdxJsxElement(node) && node.name === 'LinkCard'
      ? stringAttribute(node, 'href')
      : undefined;
  const children =
    'children' in node ? node.children.flatMap((child) => collect(child)) : [];
  return href === undefined ? children : [href, ...children];
};

export const collectLinkCardHrefs = (source: string): string[] =>
  collect(mdxParser.parse(source));
