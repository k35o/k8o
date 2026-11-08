import { readFile } from 'node:fs/promises';

import { stripAnnotationComments } from '@repo/code-highlight/parser';
import type { Root, RootContent } from 'mdast';

import { mdxParser, stringAttribute } from '@/shared/mdx/mdx-tree';
import type { MdxJsxElement } from '@/shared/mdx/mdx-tree';
import { SITE_URL } from '@/shared/site/site-url';

import { blogPath } from './path';

type Edit = { start: number; end: number; text: string };

const nodeRange = (node: RootContent): [number, number] | undefined => {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  return start === undefined || end === undefined ? undefined : [start, end];
};

// MDX記事のソースをCommonMarkとして読める素のmarkdownへ変換する。
// 全体を再シリアライズせず、MDX固有ノードのスパンだけを元テキストから置換することで、
// 本文のフォーマットを原文のまま保つ。
export const mdxToMarkdown = (source: string, slug: string): string => {
  const tree: Root = mdxParser.parse(source);
  const articleUrl = `${SITE_URL}/blog/${slug}`;
  const edits: Edit[] = [];

  const replace = (range: [number, number], text: string): void => {
    edits.push({ start: range[0], end: range[1], text });
  };

  const handleJsx = (node: MdxJsxElement, range: [number, number]): void => {
    const { name } = node;
    if (name === 'Playground') {
      const title = stringAttribute(node, 'title');
      const label =
        title === undefined
          ? 'インタラクティブデモ'
          : `インタラクティブデモ「${title}」`;
      replace(range, `> ${label}はWeb版で試せます: <${articleUrl}>`);
      return;
    }
    if (name === 'PlaygroundEmbed') {
      const sectionId = stringAttribute(node, 'sectionId');
      const demo = stringAttribute(node, 'demo');
      const url =
        sectionId === undefined
          ? articleUrl
          : `${SITE_URL}/playgrounds/${sectionId}`;
      const label =
        demo === undefined
          ? 'インタラクティブデモ'
          : `インタラクティブデモ「${demo}」`;
      replace(range, `> ${label}はWeb版で試せます: <${url}>`);
      return;
    }
    if (name === 'LinkCard') {
      const href = stringAttribute(node, 'href');
      if (href === undefined) {
        replace(range, '');
        return;
      }
      const url = href.startsWith('/') ? `${SITE_URL}${href}` : href;
      replace(range, `<${url}>`);
      return;
    }
    if (name === 'Image') {
      const alt = stringAttribute(node, 'alt');
      replace(range, alt === undefined ? '' : `（画像: ${alt}）`);
      return;
    }
    if (name === 'BrowserSupportStatus') {
      replace(range, '');
      return;
    }
    if (name === 'Alert') {
      const message = stringAttribute(node, 'message');
      replace(range, message === undefined ? '' : `> ${message}`);
      return;
    }
    // 小文字タグはraw HTMLとしてmarkdownでも意味を持つので残し、中身だけ変換する
    if (name !== null && /^[a-z]/u.test(name)) {
      walk(node.children);
      return;
    }
    // フラグメントと未知のコンポーネント: 子があればタグだけ剥がして中身を残す
    const first = node.children[0];
    const innerStart = first === undefined ? undefined : nodeRange(first)?.[0];
    const last = node.children.at(-1);
    const innerEnd = last === undefined ? undefined : nodeRange(last)?.[1];
    if (innerStart === undefined || innerEnd === undefined) {
      replace(range, '');
      return;
    }
    replace([range[0], innerStart], '');
    replace([innerEnd, range[1]], '');
    walk(node.children);
  };

  const walk = (nodes: RootContent[]): void => {
    for (const node of nodes) {
      const range = nodeRange(node);
      if (range === undefined) continue;

      if (
        node.type === 'yaml' ||
        node.type === 'mdxjsEsm' ||
        node.type === 'mdxFlowExpression' ||
        node.type === 'mdxTextExpression'
      ) {
        replace(range, '');
      } else if (
        node.type === 'mdxJsxFlowElement' ||
        node.type === 'mdxJsxTextElement'
      ) {
        handleJsx(node, range);
      } else if (node.type === 'code') {
        const slice = source.slice(range[0], range[1]);
        const stripped = stripAnnotationComments(slice);
        if (stripped !== slice) replace(range, stripped);
      } else if ('children' in node) {
        walk(node.children);
      }
    }
  };

  walk(tree.children);

  let result = source;
  for (const edit of edits.toSorted((a, b) => b.start - a.start)) {
    result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  }

  const cleaned = result
    .replaceAll(/\n{3,}/gu, '\n\n')
    .replace(/^\n+/u, '')
    .replace(/\n+$/u, '');
  return `${cleaned}\n`;
};

export const getMarkdown = async (slug: string): Promise<string> =>
  mdxToMarkdown(await readFile(blogPath(slug), 'utf-8'), slug);
