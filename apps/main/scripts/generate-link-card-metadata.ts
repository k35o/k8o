// 記事の LinkCard が描く OGP を取って JSON に書く。ビルドがリンク先へ出ないよう、取った値はコミットする。
//
// 実行: pnpm run -F main generate:link-card-metadata [--refresh]
// JSON に無い URL と、値が {} の URL を取る（一時的な失敗は流し直すだけで取り直せる）。
// --refresh は JSON にある URL もすべて取り直す。

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { fetchOgMetadata } from '@repo/helpers/og/fetch-og-metadata';
import type { OgMetadata } from '@repo/helpers/og/og-metadata';

import linkCardMetadata from '../src/content/link-card-metadata.json' with { type: 'json' };
import { collectLinkCardHrefs } from '../src/features/blog/application/link-card-urls';

const { values } = parseArgs({
  options: { refresh: { type: 'boolean', default: false } },
});

const outPath = join(
  import.meta.dirname,
  '../src/content/link-card-metadata.json',
);
const blogDir = join(import.meta.dirname, '../src/content/blog');

const hrefs = [
  ...new Set(
    readdirSync(blogDir)
      .filter((name) => !name.startsWith('.'))
      .flatMap((slug) =>
        collectLinkCardHrefs(
          readFileSync(join(blogDir, slug, 'article.mdx'), 'utf8'),
        ),
      ),
  ),
].toSorted();

const existing: Readonly<Record<string, Partial<OgMetadata>>> =
  linkCardMetadata;

const isEmpty = (value: Partial<OgMetadata>): boolean =>
  value.title === undefined &&
  value.description === undefined &&
  value.imageUrl === undefined;

const targets = values.refresh
  ? hrefs
  : hrefs.filter((href) => {
      const value = existing[href];
      return value === undefined || isEmpty(value);
    });
const fetched = new Map(
  await Promise.all(
    targets.map(async (href) => [href, await fetchOgMetadata(href)] as const),
  ),
);

const metadata = Object.fromEntries(
  hrefs.map((href) => [href, fetched.get(href) ?? existing[href] ?? {}]),
);
writeFileSync(outPath, `${JSON.stringify(metadata, null, 2)}\n`);

const empty = [...fetched].flatMap(([href, value]) =>
  isEmpty(value) ? [href] : [],
);
process.stdout.write(
  [
    `${String(hrefs.length)} 件の URL のうち ${String(targets.length)} 件を取った`,
    ...empty.map(
      (href) => `  OGP が取れなかった（URL だけのカードになる）: ${href}`,
    ),
    '',
  ].join('\n'),
);
