import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { cwd } from 'node:process';

import remarkPreset from '@repo/mdx-preset/remark';
import type { Nodes } from 'mdast';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { collectLinkCardHrefs } from './link-card-urls';
import { blogPath } from './path';

// macOS の .DS_Store のような隠しファイルだけを外す。直下に置いた foo.mdx のような誤りは、
// slug として blogPath に渡して落とす
const slugs = readdirSync(join(cwd(), 'src/content/blog')).filter(
  (name) => !name.startsWith('.'),
);

const parser = remark().use(remarkMdx).use(remarkPreset);

const parse = (slug: string) =>
  parser.parse(readFileSync(blogPath(slug), 'utf8'));

// コードブロックの中の import 文は数えず、MDX の ESM の import だけを見る
const esmImportSources = (slug: string): string[] =>
  parse(slug)
    .children.flatMap((node) =>
      node.type === 'mdxjsEsm' ? (node.data?.estree?.body ?? []) : [],
    )
    .flatMap((statement) =>
      statement.type === 'ImportDeclaration'
        ? [String(statement.source.value)]
        : [],
    );

const hasMath = (node: Nodes): boolean =>
  node.type === 'inlineMath' ||
  node.type === 'math' ||
  (node.type === 'code' && node.lang === 'math') ||
  ('children' in node && node.children.some((child) => hasMath(child)));

const mathSlugs = slugs.filter((slug) => hasMath(parse(slug)));

const defaultImports = (slug: string): Map<string, string> =>
  new Map(
    parse(slug)
      .children.flatMap((node) =>
        node.type === 'mdxjsEsm' ? (node.data?.estree?.body ?? []) : [],
      )
      .flatMap((statement) =>
        statement.type === 'ImportDeclaration'
          ? statement.specifiers.flatMap((specifier) =>
              specifier.type === 'ImportDefaultSpecifier'
                ? [[specifier.local.name, String(statement.source.value)]]
                : [],
            )
          : [],
      ),
  );

const attributeValue = (
  node: Extract<Nodes, { type: 'mdxJsxFlowElement' | 'mdxJsxTextElement' }>,
  name: string,
): string | undefined => {
  for (const attribute of node.attributes) {
    if (attribute.type === 'mdxJsxAttribute' && attribute.name === name) {
      return typeof attribute.value === 'string'
        ? attribute.value
        : attribute.value?.value;
    }
  }
  return undefined;
};

type ArticleImage = {
  src: string | undefined;
  width: string | undefined;
  height: string | undefined;
};

const collectImages = (node: Nodes): ArticleImage[] => {
  const children =
    'children' in node
      ? node.children.flatMap((child) => collectImages(child))
      : [];
  if (
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    (node.name === 'Image' || node.name === 'FloatImage')
  ) {
    return [
      {
        src: attributeValue(node, 'src'),
        width: attributeValue(node, 'width'),
        height: attributeValue(node, 'height'),
      },
      ...children,
    ];
  }
  return children;
};

const imageSlugs = slugs.filter(
  (slug) => collectImages(parse(slug)).length > 0,
);

// 実寸の比から片方の辺を丸めて決めたなら、ずれは丸めの半分に収まる
const isSameAspectRatio = (
  width: number,
  height: number,
  actual: { width: number; height: number },
): boolean =>
  Math.abs(width * actual.height - height * actual.width) <=
  Math.max(actual.width, actual.height) / 2;

const imageMismatches = async (slug: string): Promise<string[]> => {
  const imports = defaultImports(slug);
  const mismatches: string[] = [];
  for (const image of collectImages(parse(slug))) {
    const source = image.src === undefined ? undefined : imports.get(image.src);
    const width = Number(image.width);
    const height = Number(image.height);
    if (
      source === undefined ||
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width <= 0 ||
      height <= 0
    ) {
      mismatches.push(
        `src=${String(image.src)} width=${String(image.width)} height=${String(image.height)}`,
      );
      continue;
    }
    const actual = await sharp(
      join(dirname(blogPath(slug)), source),
    ).metadata();
    if (!isSameAspectRatio(width, height, actual)) {
      mismatches.push(
        `${source}: ${String(width)}×${String(height)}（実寸 ${String(actual.width)}×${String(actual.height)}）`,
      );
    }
  }
  return mismatches;
};

const linkCardMetadataHrefs = new Set(
  Object.keys(
    JSON.parse(
      readFileSync(join(cwd(), 'src/content/link-card-metadata.json'), 'utf8'),
    ),
  ),
);

describe('src/content/blog の記事', () => {
  describe('正常系', () => {
    it('記事がある', () => {
      expect(slugs.length).toBeGreaterThan(0);
    });

    it.each(slugs)('%s に article.mdx がある', (slug) => {
      expect(existsSync(blogPath(slug))).toBe(true);
    });

    it.each(slugs)('%s の MDX は @/app/ を import しない', (slug) => {
      expect(
        esmImportSources(slug).filter((source) => source.startsWith('@/app/')),
      ).toStrictEqual([]);
    });

    it.each(mathSlugs)(
      '%s は数式を使うので @repo/mdx-preset/katex.css を import する',
      (slug) => {
        expect(esmImportSources(slug)).toContain('@repo/mdx-preset/katex.css');
      },
    );

    it.each(imageSlugs)(
      '%s の Image と FloatImage は、画像の実寸と同じ縦横比の width と height を持つ',
      async (slug) => {
        expect(await imageMismatches(slug)).toStrictEqual([]);
      },
    );

    it.each(slugs)(
      '%s の LinkCard の href は、すべて src/content/link-card-metadata.json にある（無ければ generate:link-card-metadata を流す）',
      (slug) => {
        expect(
          collectLinkCardHrefs(readFileSync(blogPath(slug), 'utf8')).filter(
            (href) => !linkCardMetadataHrefs.has(href),
          ),
        ).toStrictEqual([]);
      },
    );
  });
});
