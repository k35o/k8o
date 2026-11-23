// トークのスライドの PDF をデッキにして、Vercel Blob の非公開ストアへ上げる。リポジトリは公開なので、
// デッキの中身はコミットしない。
//
// 実行: pnpm run -F @repo/media upload:talk-deck <PDF> --slug <slug> [--notes <ファイル>] [--local]
// ページごとの AVIF（960w・1920w）と、ページごとの寸法・文字とリンクの位置を持つ deck.json を
// apps/main/public/talks/<slug>/（git は見ない）に書き、同じものと元の PDF をストアの talks/<slug>/ に置く。元の PDF は
// 保管のためで、サイトには出ない。ストアに残る前の版のファイルは消す。--notes は発表者ノートのテキストで、--- だけの行でページごとに分ける（n 番目の塊が n ページ目）。
// --local は書くだけで上げない。上げるには BLOB_READ_WRITE_TOKEN が要る。
// パスは pnpm を呼んだ場所から解く。
// サイトに出るのは、talks の行の slug にこの slug を入れる migration をマージしたとき。

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

import { parsePdfDeck } from '@repo/talk-deck/deck';
import type { PdfDeck } from '@repo/talk-deck/deck';
import {
  isPdfDeckSlug,
  PDF_DECK_MANIFEST,
  PDF_DECK_SOURCE,
  PDF_PAGE_WIDTHS,
  pdfDeckBlobPrefix,
  pdfPageImage,
} from '@repo/talk-deck/files';
import { del, list, put } from '@vercel/blob';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

import { fromInvocationDir } from './invocation-dir.ts';
import { extractPageBlocks } from './pdf-page-text.ts';
import { splitNotes } from './split-notes.ts';

const USAGE =
  '使い方: pnpm run -F @repo/media upload:talk-deck <PDF> --slug <slug> [--notes <ファイル>] [--local]';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    slug: { type: 'string' },
    notes: { type: 'string' },
    local: { type: 'boolean', default: false },
  },
});

const [inputArg] = positionals;
const { slug } = values;

if (
  positionals.length !== 1 ||
  inputArg === undefined ||
  slug === undefined ||
  !isPdfDeckSlug(slug)
) {
  throw new Error(USAGE);
}

if (!values.local && !process.env['BLOB_READ_WRITE_TOKEN']) {
  throw new Error(
    'BLOB_READ_WRITE_TOKEN が無い。上げずに書くだけなら --local を付ける',
  );
}

const prefix = pdfDeckBlobPrefix(slug);

const input = fromInvocationDir(inputArg);
const outDir = join(
  import.meta.dirname,
  '../../../apps/main/public/talks',
  slug,
);
const [narrow, wide] = PDF_PAGE_WIDTHS;

// 日本語の PDF は、埋め込まれていない CMap と標準フォントを pdfjs-dist の同梱のものから読む
const pdfjsDir = dirname(
  createRequire(import.meta.url).resolve('pdfjs-dist/package.json'),
);

const document = await getDocument({
  data: new Uint8Array(await readFile(input)),
  cMapUrl: `${pdfjsDir}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${pdfjsDir}/standard_fonts/`,
  wasmUrl: `${pdfjsDir}/wasm/`,
}).promise;

// pdfjs-dist は Node では @napi-rs/canvas の canvas を作るが、型は object としか言わない
type NodeCanvasFactory = {
  create: (
    width: number,
    height: number,
  ) => {
    canvas: HTMLCanvasElement & { toBuffer: (mime: 'image/png') => Buffer };
    context: CanvasRenderingContext2D;
  };
};
const canvasFactory = document.canvasFactory as NodeCanvasFactory;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

const isLink = (
  annotation: Record<string, unknown>,
): annotation is { url: string; rect: [number, number, number, number] } =>
  annotation['subtype'] === 'Link' &&
  typeof annotation['url'] === 'string' &&
  /^https?:\/\//u.test(annotation['url']) &&
  Array.isArray(annotation['rect']);

await rm(outDir, { recursive: true, force: true });
await mkdir(join(outDir, 'pages'), { recursive: true });

const notes =
  values.notes === undefined
    ? []
    : splitNotes(await readFile(fromInvocationDir(values.notes), 'utf8'));

if (notes.length > document.numPages) {
  throw new Error(
    `ノートが ${notes.length.toString()} ページ分あり、PDF の ${document.numPages.toString()} ページより多い`,
  );
}

const pages: PdfDeck['pages'] = [];

for (let number = 1; number <= document.numPages; number += 1) {
  const page = await document.getPage(number);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: wide / base.width });
  const width = Math.round(viewport.width);
  const height = Math.round(viewport.height);

  const { canvas, context } = canvasFactory.create(width, height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  const png = canvas.toBuffer('image/png');

  await sharp(png)
    .avif()
    .toFile(join(outDir, pdfPageImage(number, wide)));
  await sharp(png)
    .resize({ width: narrow })
    .avif()
    .toFile(join(outDir, pdfPageImage(number, narrow)));

  const { items } = await page.getTextContent({ includeMarkedContent: true });
  const blocks = extractPageBlocks({
    view: page.view,
    items,
    tree: await page.getStructTree(),
  });

  const links = (await page.getAnnotations()).filter(isLink).map((link) => {
    const [x1, y1] = viewport.convertToViewportPoint(
      link.rect[0],
      link.rect[1],
    ) as [number, number];
    const [x2, y2] = viewport.convertToViewportPoint(
      link.rect[2],
      link.rect[3],
    ) as [number, number];
    const left = clamp(Math.min(x1, x2) / viewport.width);
    const top = clamp(Math.min(y1, y2) / viewport.height);
    return {
      href: link.url,
      left,
      top,
      width: clamp(Math.max(x1, x2) / viewport.width) - left,
      height: clamp(Math.max(y1, y2) / viewport.height) - top,
    };
  });

  pages.push({ width, height, blocks, notes: notes[number - 1] ?? '', links });
  page.cleanup();
  console.log(`${number.toString()} / ${document.numPages.toString()}`);
}

const deck = parsePdfDeck({ pages } satisfies PdfDeck);

await writeFile(join(outDir, PDF_DECK_MANIFEST), JSON.stringify(deck));

const files = [
  PDF_DECK_MANIFEST,
  ...pages.flatMap((_page, index) =>
    PDF_PAGE_WIDTHS.map((width) => pdfPageImage(index + 1, width)),
  ),
];

console.log(`${outDir} に ${files.length.toString()} ファイルを書いた`);

const listBlobs = async (): Promise<
  Array<{ pathname: string; url: string }>
> => {
  const blobs: Array<{ pathname: string; url: string }> = [];
  let cursor: string | undefined;
  do {
    const result = await list({
      prefix,
      ...(cursor === undefined ? {} : { cursor }),
    });
    blobs.push(...result.blobs);
    cursor = result.cursor;
  } while (cursor !== undefined);
  return blobs;
};

if (!values.local) {
  for (const file of files) {
    await put(`${prefix}${file}`, await readFile(join(outDir, file)), {
      access: 'private',
      allowOverwrite: true,
    });
  }

  await put(`${prefix}${PDF_DECK_SOURCE}`, await readFile(input), {
    access: 'private',
    allowOverwrite: true,
  });

  const current = new Set(
    [...files, PDF_DECK_SOURCE].map((file) => `${prefix}${file}`),
  );
  const stale = (await listBlobs())
    .filter((blob) => !current.has(blob.pathname))
    .map((blob) => blob.url);
  if (stale.length > 0) {
    await del(stale);
  }

  console.log(`ストアの ${prefix} に上げた`);
}
