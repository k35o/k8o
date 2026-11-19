import { readFile } from 'node:fs/promises';

import { parseDemoAllow, parseDemoName } from '@repo/code-highlight/demo';
import { parseAnnotations } from '@repo/code-highlight/parser';
import type { RootContent } from 'mdast';

import { mdxParser } from '@/shared/mdx/mdx-tree';

import { blogPath } from './path';

const DEMO_LANGS = ['html', 'css', 'js', 'tsx'] as const;

type DemoLang = (typeof DEMO_LANGS)[number];

// tsx は React の部品を export default で書き、ビルドが React ごと束ねて描く
export type BlogDemo = { name: string } & Record<DemoLang, string>;

const isDemoLang = (lang: string | null | undefined): lang is DemoLang =>
  DEMO_LANGS.some((demoLang) => demoLang === lang);

const assertOneScript = (demo: BlogDemo): void => {
  if (demo.js !== '' && demo.tsx !== '') {
    throw new Error(
      `demo="${demo.name}" には js と tsx のどちらか一方だけを書く`,
    );
  }
};

// 記事の MDX から、メタに demo="<名前>" を書いたコードブロックを例ごとに集める。記事に描くときは
// @repo/code-highlight が、隣り合う同じ名前のブロックを1つの例にまとめる
export const readDemos = (source: string): BlogDemo[] => {
  const demos = new Map<string, BlogDemo>();

  const visit = (nodes: readonly RootContent[]): void => {
    let previous: string | undefined;
    for (const node of nodes) {
      const name = node.type === 'code' ? parseDemoName(node.meta) : undefined;
      if (node.type === 'code' && name !== undefined) {
        // 権限の書き誤りを、記事を描く前に見つける
        parseDemoAllow(node.meta);
        const demo = demos.get(name);
        if (demo !== undefined && previous !== name) {
          throw new Error(
            `demo="${name}" のコードブロックは隣り合わせて書く（記事では離れたブロックが別の例に分かれる）`,
          );
        }
        if (!isDemoLang(node.lang)) {
          throw new Error(
            `demo="${name}" のコードブロックの言語は ${DEMO_LANGS.join('・')} のどれかにする: ${node.lang ?? '（無し）'}`,
          );
        }
        // 注釈の行は記事にもコピーにも出ないので、動かすコードからも外す
        const { code } = parseAnnotations(node.value);
        const base = demo ?? { name, html: '', css: '', js: '', tsx: '' };
        demos.set(name, {
          ...base,
          [node.lang]: [base[node.lang], code].filter(Boolean).join('\n'),
        });
      }
      previous = name;
      if ('children' in node) {
        visit(node.children);
      }
    }
  };

  visit(mdxParser.parse(source).children);
  const collected = [...demos.values()];
  for (const demo of collected) {
    assertOneScript(demo);
  }
  return collected;
};

export const getBlogDemos = async (slug: string): Promise<BlogDemo[]> =>
  readDemos(await readFile(blogPath(slug), 'utf-8'));
